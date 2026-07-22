using DomainLayre.Models;

namespace DomainLayre
{
    public static class ProductImageExtensions
    {
        public static string GetPrimaryPictureUrl(this Product product)
        {
            return product.Images?
                .OrderBy(i => i.DisplayOrder)
                .Select(i => i.PictureUrl)
                .FirstOrDefault(url => !string.IsNullOrWhiteSpace(url))
                ?? string.Empty;
        }
    }
}
