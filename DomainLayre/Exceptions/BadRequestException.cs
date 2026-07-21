namespace DomainLayre.Exceptions
{
    public sealed class BadRequestException(List<string> errors) : Exception("Validation Faild")
    {
        public List<string> Errors { get; } = errors;
    }
}
