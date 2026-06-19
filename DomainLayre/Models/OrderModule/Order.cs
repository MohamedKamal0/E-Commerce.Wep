namespace DomainLayre.Models.OrderModule
{
    public class Order : BaseEntity<Guid>
    {//علشان اقدر اعمل ابجكت جديد من الاوردر ده عند الكريت بلحجات الي انا عيزذها بس
        public Order()
        {

        }
        public Order(string userEmail, OrderAddress address, DeliveryMethod deliveryMethod, ICollection<OrderItem> items, decimal subtotal)
        {
            UserEmail = userEmail;
            Address = address;
            DeliveryMethod = deliveryMethod;
            Items = items;
            Subtotal = subtotal;
        }

        public string UserEmail { get; set; } = default!;
        public OrderAddress Address { get; set; } = default!;
        public DeliveryMethod DeliveryMethod { get; set; } = default!;
        public ICollection<OrderItem> Items { get; set; } = [];
        public decimal Subtotal { get; set; }
        public DateTimeOffset OrderDate { get; set; } = DateTimeOffset.Now;

        public int DliveryMethodId { get; set; }//forign key
        public OrderStatus Status { get; set; } = OrderStatus.Pending;

        //NotMapped property
        public decimal GetTotal() => Subtotal + DeliveryMethod.Price;
    }
}
