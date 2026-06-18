using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

[ApiController]
[Route("api/paypal")]
public class PayPalController : ControllerBase
{
    private readonly IHttpClientFactory _http;
    private readonly IConfiguration _config;

    // Entry price. Was hardcoded to 1.30 USD before, which didn't match
    // the $3 XCD price shown throughout the UI. Adjust this single value
    // (and currency below) to whatever the actual entry price should be.
    private const string EntryPriceUsd = "3.00";

    public PayPalController(IHttpClientFactory http, IConfiguration config)
    {
        _http = http;
        _config = config;
    }

    private async Task<string> GetAccessToken()
    {
        var client = _http.CreateClient();
        var clientId = _config["PayPal:ClientId"];
        var secret = _config["PayPal:Secret"];

        var credentials = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{clientId}:{secret}"));
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", credentials);

        var response = await client.PostAsync(
            "https://api-m.sandbox.paypal.com/v1/oauth2/token",
            new StringContent("grant_type=client_credentials", Encoding.UTF8, "application/x-www-form-urlencoded")
        );

        var json = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
            throw new Exception($"PayPal token request failed ({response.StatusCode}): {json}");

        return JsonDocument.Parse(json).RootElement.GetProperty("access_token").GetString()!;
    }

    [HttpPost("create-order")]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest req)
    {
        var token = await GetAccessToken();
        var client = _http.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var body = JsonSerializer.Serialize(new
        {
            intent = "CAPTURE",
            purchase_units = new[] { new {
                amount = new { currency_code = "USD", value = EntryPriceUsd },
                description = req.EntryId
            }},
            application_context = new
            {
                shipping_preference = "NO_SHIPPING"
            }
        });

        var response = await client.PostAsync(
            "https://api-m.sandbox.paypal.com/v2/checkout/orders",
            new StringContent(body, Encoding.UTF8, "application/json")
        );
        var json = await response.Content.ReadAsStringAsync();
        return Content(json, "application/json");
    }

    [HttpPost("capture-order/{orderId}")]
    public async Task<IActionResult> CaptureOrder(string orderId)
    {
        var token = await GetAccessToken();
        var client = _http.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await client.PostAsync(
            $"https://api-m.sandbox.paypal.com/v2/checkout/orders/{orderId}/capture",
            new StringContent("{}", Encoding.UTF8, "application/json")
        );
        var json = await response.Content.ReadAsStringAsync();
        return Content(json, "application/json");
    }
}

public record CreateOrderRequest(string EntryId);
