using FastestTyper.Server.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace FastestTyper.Server.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Entry> Entries { get; set; }
    }
}