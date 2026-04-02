using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MinutefeelingAPI.Models
{
    public class User
    {
        public int Id { get; set; }
        public string? FullName { get; set; }
        public string? Username { get; set; }
        public string? Gender { get; set; }
        public string? Hobbies { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<Highlight> Highlights { get; set; }
    }


    public class Book
    {
        public int Id { get; set; }
        [Required]
        public string Slug { get; set; }
        [Required]
        public string Title { get; set; }
        public string Subtitle { get; set; }
        public string Author { get; set; }
        public string CoverColor { get; set; }
        public ICollection<Chapter> Chapters { get; set; }
    }

    public class Chapter
    {
        public int Id { get; set; }
        public int BookId { get; set; }
        [Required]
        public string Title { get; set; }
        public string Meta { get; set; }
        public string ContentJson { get; set; } // Storing as JSON string for simplicity
        public Book Book { get; set; }
    }

    public class Highlight
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int ChapterId { get; set; }
        [Required]
        public string Text { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public User User { get; set; }
    }

    public class OtpCode
    {
        public int Id { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }
        [Required]
        public string Code { get; set; }
        public DateTime Expiry { get; set; }
        public bool IsUsed { get; set; } = false;
    }
}
