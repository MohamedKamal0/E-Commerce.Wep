namespace DomainLayre.Exceptions
{
    public sealed class AddressNotFoundException(string userName) : NotFoundException($"UserName{userName} Not Have Address")
    {
    }
}
