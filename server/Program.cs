using Microsoft.EntityFrameworkCore;
using MinutefeelingAPI.Data;
using MinutefeelingAPI.Models;

var builder = WebApplication.CreateBuilder(args);

// Use SQLite for zero-config local development and portable cloud hosting
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=library_v3.db"));


builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options => {
        options.SuppressModelStateInvalidFilter = true; // Disable strict validation to allow custom handling
    });

builder.Services.AddHttpClient();

// Enable CORS for React
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowVite",
        builder => builder.WithOrigins("http://localhost:5173", "https://books.harsharoyal.in")
                          .AllowAnyMethod()
                          .AllowAnyHeader());
});

var app = builder.Build();

// Automatically ensure Database exists and create tables if missing
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    // This will create the DB and tables if they don't exist
    // Useful for quick testing when migrations aren't applied.
    db.Database.EnsureCreated();

    // SEED ADMIN USER
    var adminEmail = builder.Configuration["AdminSettings:Email"] ?? "palettescoder@gmail.com";
    var adminPassword = builder.Configuration["AdminSettings:Password"] ?? "Slr@2233";

    if (!db.Users.Any(u => u.Email == adminEmail))
    {
        db.Users.Add(new User 
        { 
            Email = adminEmail, 
            Password = adminPassword, 
            Role = "admin", 
            Username = "palettescoder", 
            FullName = "Administrator",
            CreatedAt = DateTime.UtcNow
        });
        db.SaveChanges();
    }
}

app.UseCors("AllowVite");
app.MapControllers();

app.Run();
