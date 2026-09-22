using DomainLayre.Models;
using SheredLayer;

namespace ServiceLayer.Specifications
{
    class ProductWithprandAndTyepSpecification : BaseSpecification<Product>
    {
        public ProductWithprandAndTyepSpecification(productQueryParams queryParams)
            : base(ProductQueryFilters.Create(queryParams))
        {
            AddInclude(p => p.Product_Brand);
            AddInclude(p => p.Product_Type);
            AddInclude(p => p.Images);
            switch (queryParams.sortingOption)
            {
                case ProductSortingOptions.NameASC:
                    AddOrderBy(p => p.Name);
                    AddThenByDescending(p => p.Id);
                    break;
                case ProductSortingOptions.NameDEC:
                    AddOrderByDescending(p => p.Name);
                    AddThenByDescending(p => p.Id);
                    break;
                case ProductSortingOptions.PriceASC:
                    AddOrderBy(p => p.Price);
                    AddThenByDescending(p => p.Id);
                    break;
                case ProductSortingOptions.PriceDEC:
                    AddOrderByDescending(p => p.Price);
                    AddThenByDescending(p => p.Id);
                    break;
                case ProductSortingOptions.Newest:
                default:
                    // Newest first. Missing/default dates sort last but the product is still returned.
                    AddOrderByDescending(p => p.CreatedAt);
                    AddThenByDescending(p => p.Id);
                    break;
            }

            // OFFSET/FETCH requires ORDER BY — never paginate an unsorted query.
            if (OrderBy is null && OrderByDescending is null)
            {
                AddOrderByDescending(p => p.CreatedAt);
                AddThenByDescending(p => p.Id);
            }

            var pageIndex = queryParams.PageIndex < 1 ? 1 : queryParams.PageIndex;
            var pageSize = queryParams.PageSize < 1 ? 9 : queryParams.PageSize;
            ApplyPagination(pageSize, pageIndex);
        }

        public ProductWithprandAndTyepSpecification(int id) : base(x => x.Id == id)
        {
            AddInclude(p => p.Product_Brand);
            AddInclude(p => p.Product_Type);
            AddInclude(p => p.Images);
        }
    }
}
