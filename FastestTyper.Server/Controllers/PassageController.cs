using Microsoft.AspNetCore.Mvc;

namespace FastestTyper.Server.Controllers
{
    [ApiController]
    [Route("api/passages")]
    public class PassageController : ControllerBase
    {
        private static readonly string[] Passages = new[]
        {
            "The morning light crept slowly across the harbour, painting the water in shades of amber and rose. Fishermen were already out, their voices carrying softly across the still surface. A pelican glided low, then folded its wings and plunged into the shimmering deep below the old docks.",
            "She had spent three summers on the island and still found new things to love about it. The breadfruit trees along the road, the smell of salt and spice in the market, the way strangers greeted each other with warmth and a smile. She never, ever wanted to leave this beautiful island.",
            "Rain in the tropics is nothing like rain elsewhere. It arrives without warning, turns the street to river, then vanishes just as fast. Children run out to play in the last of it. The earth smells clean and alive. The colours of everything seem much brighter than before the big rain.",
            "The cricket match had drawn a crowd from every village on the island. Men leaned on fences and called out advice nobody asked for. A mongoose darted across the outfield and everyone laughed. When the last wicket fell, the winning side celebrated long into the warm and starlit night.",
            "Market day begins before sunrise on this side of the island. Women arrange mangoes and soursop in careful rows, their colours vivid against the wooden stalls. The smell of fresh bread drifts from a nearby bakery. By midmorning every basket is empty and the square falls quiet again!!",
            "He learned to sail on a borrowed boat with a torn sail and no engine. His uncle taught him to read the wind by watching the water and feeling the rope. Years later he would teach his own son the same way, in the same small bay, at sunset, when the day was finally coming to a close!!",
            "The old school sat on a hill above the town, its windows open to catch the breeze. Students wrote in lined notebooks and recited their lessons aloud. The teacher tapped a wooden ruler on the desk to keep the rhythm. Outside, the sea glittered all the way to the wide, clear horizon!!",
            "Carnival comes once a year and the whole island feels it weeks before. Costumes are sewn in secret, steel pan bands rehearse in yards at night. When the day arrives the streets fill with colour and music and joy. Everyone dances, young and old, from the very first light until dusk!!",
        };

        [HttpGet("random")]
        public IActionResult GetRandom()
        {
            var passage = Passages[Random.Shared.Next(Passages.Length)];
            return Ok(new { text = passage });
        }
    }
}