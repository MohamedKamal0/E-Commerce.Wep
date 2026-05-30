using DomainLayre.Models;
using SheredLayer;

namespace ServiceLayer.Specifications
{
    class BrandCountSpecification : BaseSpecification<Product_Brand>
    {
        public BrandCountSpecification(BrandQueryParams queryParams) :
             base
             (p => (string.IsNullOrWhiteSpace(queryParams.SearchValue) || p.Name.ToLower().Contains(queryParams.SearchValue.ToLower()))
             )
        {

        }
    }
}
