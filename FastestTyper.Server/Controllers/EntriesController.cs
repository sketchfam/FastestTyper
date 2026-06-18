using FastestTyper.Server.Data;
using FastestTyper.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FastestTyper.Server.Controllers
{
    [ApiController]
    [Route("api/entries")]
    public class EntriesController : ControllerBase
    {
        private readonly AppDbContext _db;

        public EntriesController(AppDbContext db)
        {
            _db = db;
        }

        public class CreateEntryRequest
        {
            public string EntryId { get; set; } = ""; // client-generated string, used as PayPal's internal reference only
            public string PayPalOrderId { get; set; } = "";
        }

        public class CompleteEntryRequest
        {
            public int EntryId { get; set; } // real DB integer Id, not the client-generated string
            public int Wpm { get; set; }
            public int Accuracy { get; set; }
            public long TimeMs { get; set; }
        }

        // Called right after PayPal payment capture succeeds.
        // Creates the real Entry row in the database and returns its real integer Id,
        // which the frontend must use for everything from this point on.
        [HttpPost("create")]
        [Authorize]
        public async Task<IActionResult> CreateEntry([FromBody] CreateEntryRequest req)
        {
            var googleId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
            if (googleId == null) return Unauthorized();

            var user = await _db.Users.FirstOrDefaultAsync(u => u.GoogleId == googleId);
            if (user == null) return NotFound("User not found.");

            var entry = new Entry
            {
                EntryId = req.EntryId,
                PayPalOrderId = req.PayPalOrderId,
                Status = "ready",
                UserId = user.Id,
                CreatedAt = DateTime.UtcNow,
            };

            _db.Entries.Add(entry);
            await _db.SaveChangesAsync();

            return Ok(new
            {
                entry.Id,
                entry.EntryId,
                entry.Status,
                entry.CreatedAt
            });
        }

        [HttpPost("complete")]
        [Authorize]
        public async Task<IActionResult> CompleteEntry([FromBody] CompleteEntryRequest req)
        {
            var googleId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
            if (googleId == null) return Unauthorized();

            var entry = await _db.Entries
                .Include(e => e.User)
                .FirstOrDefaultAsync(e => e.Id == req.EntryId);

            if (entry == null) return NotFound();
            if (entry.User.GoogleId != googleId) return Forbid();

            entry.Wpm = req.Wpm;
            entry.Accuracy = req.Accuracy;
            entry.TimeMs = req.TimeMs;
            entry.Status = "completed";

            await _db.SaveChangesAsync();

            return Ok(new { entry.Id, entry.Wpm, entry.Accuracy, entry.TimeMs, entry.Status });
        }
    }
}
