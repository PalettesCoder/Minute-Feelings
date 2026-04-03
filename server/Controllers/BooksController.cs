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

        [HttpPost]
        public async Task<ActionResult<Book>> CreateBook(Book book)
        {
            if (await _context.Books.AnyAsync(b => b.Slug == book.Slug))
            {
                return BadRequest("Book with this slug already exists");
            }

            _context.Books.Add(book);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBook), new { slug = book.Slug }, book);
        }

        [HttpPost("{bookId}/chapters")]
        public async Task<ActionResult<Chapter>> CreateChapter(int bookId, Chapter chapter)
        {
            var book = await _context.Books.FindAsync(bookId);
            if (book == null) return NotFound("Book not found");

            chapter.BookId = bookId;
            _context.Chapters.Add(chapter);
            await _context.SaveChangesAsync();

            return Ok(chapter);
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
                    new Chapter { Title = "The Minute on the Fourth Floor Stairs", Meta = "White dress, open hair, eternal memory.", ContentJson = "[\"The final bell had rung. St. Mary’s High School was emptying out. It was the last day for the 10th standard students after their board exams.\", \"Veera stood on the fourth-floor landing, bag on his shoulder, ready to descend for the last time...\"]" }
                }
            };

            _context.Books.Add(book1);
            await _context.SaveChangesAsync();
            return Ok("Seeding complete");
        }
    }
}
