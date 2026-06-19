namespace SheredLayer.DTOs
{
    public class OrderDto
    {
        public string BasketId { get; set; } = default!;
        public int DeliveryMethodId { get; set; }
        public AddressDto address { get; set; } = default!;


    }
}
