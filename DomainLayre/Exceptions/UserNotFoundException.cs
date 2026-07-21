namespace DomainLayre.Exceptions
{
    public sealed class UserNotFoundException(string email) : NotFoundException($"User with Email {email} Is Not Found")
    {

    }
}
