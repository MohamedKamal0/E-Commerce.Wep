namespace SheredLayer
{
    public class productQueryParams
    {
        private const int MaxPageSize = 10;
        private const int DefaultPageSize = 5;
        public int? BrabdId { get; set; }
        public int? TyepId { get; set; }
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
