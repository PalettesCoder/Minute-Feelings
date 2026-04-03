using Microsoft.EntityFrameworkCore;
using MinutefeelingAPI.Models;

namespace MinutefeelingAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Book> Books { get; set; }
        public DbSet<Chapter> Chapters { get; set; }
        public DbSet<Highlight> Highlights { get; set; }
        public DbSet<UserBookmark> Bookmarks { get; set; }
        public DbSet<OtpCode> OtpCodes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Book>().HasIndex(b => b.Slug).IsUnique();
        }
    }
}
