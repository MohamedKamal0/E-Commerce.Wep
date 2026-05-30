namespace SheredLayer
{
    public class BrandQueryParams
    {
        private const int MaxPageSize = 10;
        private const int DefaultPageSize = 5;

        public ProductSortingOptions sortingOption { get; set; }
        public string? SearchValue { get; set; }
        public int PageIndex { get; set; } = 1;
        private int pageSize = DefaultPageSize;
        public int PageSize
        {
            get { return pageSize; }
            set { pageSize = (value > MaxPageSize) ? MaxPageSize : value; }
        }
    }
}
