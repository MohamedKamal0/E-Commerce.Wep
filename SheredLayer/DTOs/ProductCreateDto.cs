using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace SheredLayer.DTOs
{
    public class ProductCreateDto
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = default!;

        [Required]
        public string Description { get; set; } = default!;

        /// <summary>Uploaded image files from multipart form.</summary>
        public List<IFormFile> Images { get; set; } = [];

        /// <summary>Saved relative paths — set by the API after upload.</summary>
        public List<string> PictureUrls { get; set; } = [];

        [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than zero")]
        public decimal Price { get; set; }

        [MaxLength(32)]
        public string? Color { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "BrandId is required")]
        public int BrandId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "TyepId is required")]
        public int TyepId { get; set; }
    }
}
