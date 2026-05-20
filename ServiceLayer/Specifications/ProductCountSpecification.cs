using DomainLayre.Models;
using SheredLayer;

namespace ServiceLayer.Specifications
{
    class ProductCountSpecification : BaseSpecification<Product>
    {
        public ProductCountSpecification(productQueryParams queryParams)
        : base(p => (!queryParams.BrabdId.HasValue || p.BrandId == queryParams.BrabdId)
            && (!queryParams.TyepId.HasValue || p.TyepId == queryParams.TyepId)
            && (string.IsNullOrWhiteSpace(queryParams.SearchValue) || p.Name.ToLower().Contains(queryParams.SearchValue.ToLower())))
        {

        }
    }
}
