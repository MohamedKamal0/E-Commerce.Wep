namespace SheredLayer.DTOs
{
    public class OrderToReturn
    {
        public Guid Id { get; set; }
        public string UserEmail { get; set; } = default!;
        public DateTimeOffset OrderDate { get; set; }
        public AddressDto Address { get; set; } = default!;
        public string DeliveryMethod { get; set; } = default!;
        public string Status { get; set; } = default!;

        public ICollection<OrderItemDto> Items { get; set; } = [];
        public decimal Subtotal { get; set; }
        //NotMapped property
        public decimal Total { get; set; }

    }
}
