using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MinutefeelingAPI.Data;
using MinutefeelingAPI.Models;

namespace MinutefeelingAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookmarksController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BookmarksController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{userId}")]
        public async Task<ActionResult<IEnumerable<UserBookmark>>> GetBookmarks(int userId)
        {
            return await _context.Bookmarks
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<UserBookmark>> CreateBookmark([FromBody] UserBookmark bookmark)
        {
            // Check if already bookmarked
            var exists = await _context.Bookmarks
                .AnyAsync(b => b.UserId == bookmark.UserId && b.ChapterId == bookmark.ChapterId);
            
            if (exists) return BadRequest("Already bookmarked");

            _context.Bookmarks.Add(bookmark);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetBookmarks), new { userId = bookmark.UserId }, bookmark);
        }

        [HttpDelete("{userId}/{chapterId}")]
        public async Task<IActionResult> DeleteBookmark(int userId, int chapterId)
        {
            var bookmark = await _context.Bookmarks
                .FirstOrDefaultAsync(b => b.UserId == userId && b.ChapterId == chapterId);
            
            if (bookmark == null) return NotFound();

            _context.Bookmarks.Remove(bookmark);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
