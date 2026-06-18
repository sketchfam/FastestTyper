namespace FastestTyper.Server.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Email { get; set; } = "";
        public string GoogleId { get; set; } = "";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public List<Entry> Entries { get; set; } = new();
    }
}