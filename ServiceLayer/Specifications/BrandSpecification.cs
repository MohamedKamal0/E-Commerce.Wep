using DomainLayre.Models;
using SheredLayer;

namespace ServiceLayer.Specifications
{
    class BrandSpecification : BaseSpecification<Product_Brand>
    {
        public BrandSpecification(BrandQueryParams queryParams) :
            base(
           p => ((string.IsNullOrWhiteSpace(queryParams.SearchValue) || p.Name.ToLower().Contains(queryParams.SearchValue.ToLower()))
            ))
        {

            switch (queryParams.sortingOption)
            {
                case ProductSortingOptions.NameASC:
                    AddOrderBy(p => p.Name);
                    break;
                case ProductSortingOptions.NameDEC:
                    AddOrderByDescending(p => p.Name);
                    break;

                default:
                    break;

            }
            ApplyPagination(queryParams.PageSize, queryParams.PageIndex);
        }
    }
}
