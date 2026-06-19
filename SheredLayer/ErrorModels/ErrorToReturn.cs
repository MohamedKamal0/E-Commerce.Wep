namespace SheredLayer.ErrorModels
{
    public class ErrorToReturn
    {
        public int StatuseCode { get; set; }
        public string ErrorMessage { get; set; } = default!;
    }
}
