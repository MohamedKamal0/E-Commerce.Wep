using DomainLayre.Models;
using SheredLayer;

namespace ServiceLayer.Specifications
{
    class ProductCountSpecification : BaseSpecification<Product>
    {
        public ProductCountSpecification(productQueryParams queryParams)
            : base(ProductQueryFilters.Create(queryParams))
        {
        }
    }
}
