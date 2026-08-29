using DomainLayre.Models;
using SheredLayer;

namespace ServiceLayer.Specifications
{
    class ProductWithprandAndTyepSpecification : BaseSpecification<Product>
    {
        public ProductWithprandAndTyepSpecification(productQueryParams queryParams) :
            base(p => (!queryParams.BrabdId.HasValue || p.BrandId == queryParams.BrabdId)
            && (!queryParams.TyepId.HasValue || p.TyepId == queryParams.TyepId)
            && (string.IsNullOrWhiteSpace(queryParams.SearchValue) || p.Name.ToLower().Contains(queryParams.SearchValue.ToLower()))
            )
        {
            AddInclude(p => p.Product_Brand);
            AddInclude(p => p.Product_Type);
            AddInclude(p => p.Images);
            switch (queryParams.sortingOption)
            {
                case ProductSortingOptions.NameASC:
                    AddOrderBy(p => p.Name);
                    break;
                case ProductSortingOptions.NameDEC:
                    AddOrderByDescending(p => p.Name);
                    break;
                case ProductSortingOptions.PriceASC:
                    AddOrderBy(p => p.Price);
                    break;
                case ProductSortingOptions.PriceDEC:
                    AddOrderByDescending(p => p.Price);
                    break;
                default:
                    if (!string.IsNullOrWhiteSpace(queryParams.SearchValue))
                        AddOrderBy(p => p.Name);
                    break;
            }
            ApplyPagination(queryParams.PageSize, queryParams.PageIndex);
        }
        public ProductWithprandAndTyepSpecification(int id) : base(x => x.Id == id)
        {
            AddInclude(p => p.Product_Brand);
            AddInclude(p => p.Product_Type);
            AddInclude(p => p.Images);
        }
    }
}
