using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MinutefeelingAPI.Data;
using MinutefeelingAPI.Models;

namespace MinutefeelingAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HighlightsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public HighlightsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{userId}")]
        public async Task<ActionResult<IEnumerable<Highlight>>> GetHighlights(int userId)
        {
            return await _context.Highlights
                .Where(h => h.UserId == userId)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Highlight>> CreateHighlight([FromBody] Highlight highlight)
        {
            _context.Highlights.Add(highlight);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetHighlights), new { userId = highlight.UserId }, highlight);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHighlight(int id)
        {
            var highlight = await _context.Highlights.FindAsync(id);
            if (highlight == null) return NotFound();

            _context.Highlights.Remove(highlight);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
