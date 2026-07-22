namespace DomainLayre.Models
{
    public class ProductImage : BaseEntity<int>
    {
        public string PictureUrl { get; set; } = default!;
        public int DisplayOrder { get; set; }
        public int ProductId { get; set; }
        public Product Product { get; set; } = default!;
    }
}
