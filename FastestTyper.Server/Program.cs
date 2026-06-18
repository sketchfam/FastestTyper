using FastestTyper.Server.Data;
using FastestTyper.Server.Models;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Google OAuth Authentication Configuration
builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = "Cookies";
    options.DefaultChallengeScheme = "Google";
})
.AddCookie("Cookies", options =>
{
    // Explicit settings so the cookie reliably survives reloads in this
    // dev setup (Vite proxy on :5173, backend actually on :7185).
    options.Cookie.Name = "FastestTyper.Auth";
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Lax;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always; // backend is https in dev too
    options.ExpireTimeSpan = TimeSpan.FromDays(7);
    options.SlidingExpiration = true;

    // For an API-driven SPA, return 401/403 instead of redirecting to a login page,
    // so failed session checks from fetch() don't get a redirect/HTML response.
    options.Events.OnRedirectToLogin = context =>
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return Task.CompletedTask;
    };
    options.Events.OnRedirectToAccessDenied = context =>
    {
        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        return Task.CompletedTask;
    };
})
.AddGoogle("Google", options =>
{
    options.ClientId = builder.Configuration["Google:ClientId"]!;
    options.ClientSecret = builder.Configuration["Google:ClientSecret"]!;
    options.CallbackPath = "/signin-google";

    options.Events = new OAuthEvents
    {
        OnTicketReceived = async context =>
        {
            var principal = context.Principal!;
            var email = principal.FindFirstValue(ClaimTypes.Email);
            var name = principal.FindFirstValue(ClaimTypes.Name);
            var googleId = principal.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(googleId))
                return;

            var db = context.HttpContext.RequestServices.GetRequiredService<AppDbContext>();

            var existingUser = await db.Users
                .FirstOrDefaultAsync(u => u.GoogleId == googleId);

            if (existingUser is null)
            {
                db.Users.Add(new User
                {
                    Name = name ?? "",
                    Email = email,
                    GoogleId = googleId,
                    CreatedAt = DateTime.UtcNow
                });
                await db.SaveChangesAsync();
            }
        }
    };
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddHttpClient();

// Allow the Vite dev server (different origin) to send credentials (cookies)
// with its requests to this API.
builder.Services.AddCors(options =>
{
    options.AddPolicy("ViteDev", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

app.UseDefaultFiles();
app.MapStaticAssets();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors("ViteDev");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();