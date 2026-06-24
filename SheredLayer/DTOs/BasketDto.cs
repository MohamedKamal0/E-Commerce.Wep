namespace SheredLayer.DTOs
{
    public class BasketDto
    {

        public string Id { get; set; }
        public ICollection<BasketItemDto> Items { get; set; } = [];

        public string? clientSecret { get; set; }
        public string? paymentIntentId { get; set; }
        public int? deliveryMethodId { get; set; }
        public decimal? shippingPrice { get; set; }

    }
}
