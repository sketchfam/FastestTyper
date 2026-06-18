using FastestTyper.Server.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FastestTyper.Server.Controllers
{
    [ApiController]
    [Route("api/leaderboard")]
    public class LeaderboardController : ControllerBase
    {
        private readonly AppDbContext _db;

        public LeaderboardController(AppDbContext db)
        {
            _db = db;
        }

        public class LeaderboardRow
        {
            public int Rank { get; set; }
            public string Name { get; set; } = "";
            public int Wpm { get; set; }
            public long TimeMs { get; set; }
            public int Entries { get; set; }
        }

        [HttpGet]
        [HttpGet]
        public async Task<IActionResult> GetLeaderboard()
        {
            // Pull all completed entries with their owning user's name.
            var completed = await _db.Entries
                .Where(e => e.Status == "completed" && e.Wpm != null && e.TimeMs != null)
                .Select(e => new
                {
                    e.UserId,
                    e.User.Name,
                    e.Wpm,
                    e.TimeMs
                })
                .ToListAsync();

            // Group by user, take their best entry (highest WPM, then lowest TimeMs as tiebreak),
            // and count how many entries they've submitted in total.
            var ranked = completed
                .GroupBy(e => e.UserId)
                .Select(g => new
                {
                    Name = g.First().Name,
                    Best = g.OrderByDescending(e => e.Wpm)
                            .ThenBy(e => e.TimeMs)
                            .First(),
                    EntryCount = g.Count()
                })
                .OrderByDescending(x => x.Best.Wpm)
                .ThenBy(x => x.Best.TimeMs)
                .Select((x, i) => new LeaderboardRow
                {
                    Rank = i + 1,
                    Name = x.Name,
                    Wpm = x.Best.Wpm!.Value,
                    TimeMs = x.Best.TimeMs!.Value,
                    Entries = x.EntryCount
                })
                .ToList();

            return Ok(ranked.Take(10));  // ← Only change here
        }
    }
}
