namespace FastestTyper.Server.Models
{
    public class Entry
    {
        public int Id { get; set; }
        public string EntryId { get; set; } = "";
        public string PayPalOrderId { get; set; } = "";
        public int? Wpm { get; set; }
        public int? Accuracy { get; set; }
        public long? TimeMs { get; set; }   // elapsed time in milliseconds, for tiebreaking
        public string Status { get; set; } = "ready"; // ready | completed
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int UserId { get; set; }
        public User User { get; set; } = null!;
    }
}