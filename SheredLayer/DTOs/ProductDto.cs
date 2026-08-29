namespace SheredLayer.DTOs
{
    public class ProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = default!;

        public string Brand { get; set; } = default!;
        public string Type { get; set; } = default!;

        public List<ProductImageDto> Images { get; set; } = [];

        /// <summary>Primary image — first entry in <see cref="PictureUrls"/> (backward compatible).</summary>
        public string PictureUrl { get; set; } = default!;

        public List<string> PictureUrls { get; set; } = [];

        public string BrandName { get; set; } = default!;
        public string TypeName { get; set; } = default!;
        public decimal Price { get; set; }
    }
}
