using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MinutefeelingAPI.Data;
using MinutefeelingAPI.Models;
using System.Text.Json.Nodes;
using System.Net.Http;
using System.Text.Json;
using System.Text;

namespace MinutefeelingAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;

        // EMAILJS SERVER-SIDE CONFIG
        private const string EMAILJS_SERVICE_ID = "service_val0glr";
        private const string EMAILJS_TEMPLATE_ID = "template_81082yp";
        private const string EMAILJS_PUBLIC_KEY = "G8jc2t6dBS8BNn7sQ";

        public AuthController(AppDbContext context, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
        }

        [HttpPost("send-otp")]
        public async Task<IActionResult> SendOtp([FromBody] JsonObject request)
        {
            string? phoneNumber = request["phoneNumber"]?.ToString();
            string? email = request["email"]?.ToString();
            string? username = request["username"]?.ToString();

            if (string.IsNullOrEmpty(phoneNumber) && string.IsNullOrEmpty(email))
                return BadRequest("Phone number or email is required");

            // CHECK UNIQUE USERNAME IF PROVIDED
            if (!string.IsNullOrEmpty(username)) {
                var exists = await _context.Users.AnyAsync(u => u.Username == username);
                if (exists) return BadRequest("Username is already taken.");
            }

            // CHECK UNIQUE EMAIL IF PROVIDED
            if (!string.IsNullOrEmpty(email)) {
                var exists = await _context.Users.AnyAsync(u => u.Email == email);
                // If username is provided, it's a new signup check.
                if (!string.IsNullOrEmpty(username) && exists) return BadRequest("Email is already registered.");
            }

            // IF LOGIN ATTEMPT (No username provided), verify account exists
            if (string.IsNullOrEmpty(username)) {
                bool exists = false;
                if (!string.IsNullOrEmpty(email)) exists = await _context.Users.AnyAsync(u => u.Email == email);
                else if (!string.IsNullOrEmpty(phoneNumber)) exists = await _context.Users.AnyAsync(u => u.PhoneNumber == phoneNumber);
                
                if (!exists) return BadRequest("ACCOUNT_NOT_FOUND");
            }

            var code = new Random().Next(1000, 9999).ToString();
            Console.WriteLine($"[AUTH] Generated code {code} for {(string.IsNullOrEmpty(email) ? phoneNumber : email)}");

            var otpRecord = new OtpCode {
                PhoneNumber = phoneNumber,
                Email = email,
                Code = code,
                Expiry = DateTime.UtcNow.AddMinutes(15),
                IsUsed = false
            };

            _context.OtpCodes.Add(otpRecord);
            await _context.SaveChangesAsync();

            // SEND EMAIL FROM SERVER-SIDE
            if (!string.IsNullOrEmpty(email))
            {
                _ = Task.Run(async () => {
                    try {
                        using var client = _httpClientFactory.CreateClient();
                        client.Timeout = TimeSpan.FromSeconds(10);
                        
                        var expiryTime = DateTime.UtcNow.AddMinutes(15).AddHours(5).AddMinutes(30).ToString("hh:mm tt");
                        
                        var emailPayload = new {
                            service_id = EMAILJS_SERVICE_ID,
                            template_id = EMAILJS_TEMPLATE_ID,
                            user_id = EMAILJS_PUBLIC_KEY,
                            template_params = new {
                                email = email,
                                passcode = code,
                                time = expiryTime,
                                app_name = "Minute Feelings: The Scribbled Library"
                            }
                        };

                        var content = new StringContent(JsonSerializer.Serialize(emailPayload), Encoding.UTF8, "application/json");
                        var response = await client.PostAsync("https://api.emailjs.com/api/v1.0/email/send", content);

                        if (!response.IsSuccessStatusCode) {
                            var error = await response.Content.ReadAsStringAsync();
                            Console.WriteLine($"[EMAILJS ERROR] {error}");
                        } else {
                            Console.WriteLine($"[EMAIL SUCCESS] Verification code {code} sent to {email}");
                        }
                    } catch (Exception ex) {
                        Console.WriteLine($"[EMAIL ERROR] {ex.Message}");
                    }
                });
            }

            return Ok(new { message = "Verification code has been sent." });

        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] JsonObject request)
        {
            string? phoneNumber = request["phoneNumber"]?.ToString();
            string? email = request["email"]?.ToString();
            string? code = request["code"]?.ToString();

            if (string.IsNullOrEmpty(code))
                return BadRequest("Verification code is required");

            var otpRecord = await _context.OtpCodes
                .Where(o => (o.PhoneNumber == phoneNumber || o.Email == email) 
                           && o.Code == code && !o.IsUsed)
                .OrderByDescending(o => o.Expiry)
                .FirstOrDefaultAsync();

            if (otpRecord == null || otpRecord.Expiry < DateTime.UtcNow)
                return BadRequest("Invalid or expired OTP");

            otpRecord.IsUsed = true;
            await _context.SaveChangesAsync();


            User user;
            // Get profile data from request if present
            string? fullName = request["fullName"]?.ToString();
            string? username = request["username"]?.ToString();
            string? gender = request["gender"]?.ToString();
            string? hobbies = request["hobbies"]?.ToString();

            if (!string.IsNullOrEmpty(phoneNumber)) {
                user = await _context.Users.FirstOrDefaultAsync(u => u.PhoneNumber == phoneNumber);
                if (user == null) {
                    user = new User { 
                        PhoneNumber = phoneNumber,
                        FullName = fullName,
                        Username = username,
                        Gender = gender,
                        Hobbies = hobbies 
                    };
                    _context.Users.Add(user);
                } else {
                    // Update profile if provided (e.g. they corrected it)
                    if (!string.IsNullOrEmpty(fullName)) user.FullName = fullName;
                    if (!string.IsNullOrEmpty(username)) user.Username = username;
                    if (!string.IsNullOrEmpty(hobbies)) user.Hobbies = hobbies;
                }
                await _context.SaveChangesAsync();
            } else {
                user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
                if (user == null) {
                    user = new User { 
                        Email = email,
                        FullName = fullName,
                        Username = username,
                        Gender = gender,
                        Hobbies = hobbies 
                    };
                    _context.Users.Add(user);
                } else {
                    // Update profile for existing email user
                    if (!string.IsNullOrEmpty(fullName)) user.FullName = fullName;
                    if (!string.IsNullOrEmpty(username)) user.Username = username;
                    if (!string.IsNullOrEmpty(hobbies)) user.Hobbies = hobbies;
                }
                await _context.SaveChangesAsync();
            }

            return Ok(new { user.Id, user.PhoneNumber, user.Email, user.FullName, user.Username, user.Gender, user.Hobbies, user.CreatedAt });
        }

        [HttpPost("update-profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] JsonObject request)
        {
            int? id = request["id"]?.GetValue<int>();
            string? hobbies = request["hobbies"]?.ToString();
            
            if (id == null) return BadRequest("User ID is required");

            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("User not found");

            if (!string.IsNullOrEmpty(hobbies)) user.Hobbies = hobbies;
            
            await _context.SaveChangesAsync();
            return Ok(user);
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();
            return Ok(users);
        }
    }
}
