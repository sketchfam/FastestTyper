using FastestTyper.Server.Data;
using FastestTyper.Server.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FastestTyper.Server.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;

        public AuthController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet("login/google")]
        public IActionResult LoginWithGoogle()
        {
            var backendUrl = Environment.GetEnvironmentVariable("BACKEND_URL") ?? "https://localhost:7185";
            var props = new AuthenticationProperties
            {
                RedirectUri = $"{backendUrl}/api/auth/callback/google"
            };
            return Challenge(props, "Google");
        }

        [HttpGet("callback/google")]
        public async Task<IActionResult> GoogleCallback()
        {
            var result = await HttpContext.AuthenticateAsync("Cookies");
            if (!result.Succeeded) return Unauthorized();

            var claims = result.Principal.Claims;
            var googleId = claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value ?? "";
            var name = claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value ?? "";
            var email = claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value ?? "";

            var user = await _db.Users.FirstOrDefaultAsync(u => u.GoogleId == googleId);
            if (user == null)
            {
                user = new User { GoogleId = googleId, Name = name, Email = email };
                _db.Users.Add(user);
                await _db.SaveChangesAsync();
            }

            // *** IMPORTANT: Persist the authentication cookie for future requests ***
            await HttpContext.SignInAsync("Cookies", result.Principal);

            var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:5173";
            var query = $"?userId={user.Id}&name={Uri.EscapeDataString(name)}&email={Uri.EscapeDataString(email)}";
            return Redirect($"{frontendUrl}/auth-callback{query}");
        }

        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            if (!User.Identity?.IsAuthenticated ?? true) return Unauthorized();

            var googleId = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(googleId)) return Unauthorized();

            var user = await _db.Users
                .Include(u => u.Entries)
                .FirstOrDefaultAsync(u => u.GoogleId == googleId);

            if (user == null) return NotFound();

            var entries = user.Entries.Select(e => new
            {
                e.Id,
                e.EntryId,
                e.PayPalOrderId,
                e.Status,
                e.Wpm,
                e.Accuracy,
                e.TimeMs,
                e.CreatedAt
            });

            return Ok(new
            {
                user.Id,
                user.Name,
                user.Email,
                Entries = entries
            });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync("Cookies");
            return Ok();
        }
    }
}