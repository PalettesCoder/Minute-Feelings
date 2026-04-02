using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MinutefeelingAPI.Data;
using MinutefeelingAPI.Models;

namespace MinutefeelingAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BooksController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BooksController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Book>>> GetBooks()
        {
            return await _context.Books.Include(b => b.Chapters).ToListAsync();
        }

        [HttpGet("{slug}")]
        public async Task<ActionResult<Book>> GetBook(string slug)
        {
            var book = await _context.Books.Include(b => b.Chapters).FirstOrDefaultAsync(b => b.Slug == slug);
            if (book == null) return NotFound();
            return book;
        }

        // Seeding initial data (helper)
        [HttpPost("seed")]
        public async Task<IActionResult> Seed()
        {
            if (await _context.Books.AnyAsync()) return BadRequest("Data already seeded");

            var book1 = new Book {
                Slug = "one-minute-fourth-floor",
                Title = "One Minute on the Fourth Floor",
                Subtitle = "THE SPARK THAT NEVER FADED",
                Author = "Veera",
                CoverColor = "#5d4037",
                Chapters = new List<Chapter> {
                    new Chapter { Title = "Chapter 1: The Lift", Meta = "October 14th, 4:12 PM", ContentJson = "The fourth floor is where time stops..." }
                }
            };

            _context.Books.Add(book1);
            await _context.SaveChangesAsync();
            return Ok("Seeding complete");
        }
    }
}
