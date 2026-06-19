using DomainLayre.Exceptions;
using SheredLayer.ErrorModels;

namespace E_Commerce.Wep.CustomMiddleWares
{
    public class CustomExceptipnHandlerMiddleWare
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<CustomExceptipnHandlerMiddleWare> _logger;
        public CustomExceptipnHandlerMiddleWare(RequestDelegate Next, ILogger<CustomExceptipnHandlerMiddleWare> logger)
        {
            _next = Next;
            _logger = logger;
        }
        public async Task InvokeAsync(HttpContext httpContext)
        {
            try
            {
                await _next.Invoke(httpContext);
                if (httpContext.Response.StatusCode == StatusCodes.Status404NotFound)
                {
                    var Response = new ErrorToReturn()
                    {
                        StatuseCode = StatusCodes.Status404NotFound,
                        ErrorMessage = $"End Point{httpContext.Request.Path}is not found"
                    };
                    await httpContext.Response.WriteAsJsonAsync(Response);
                }

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Something Went Wrong");
                httpContext.Response.StatusCode = ex switch
                {
                    NotFoundException => StatusCodes.Status404NotFound,
                    _ => StatusCodes.Status500InternalServerError
                };

                var Response = new ErrorToReturn()
                {
                    StatuseCode = httpContext.Response.StatusCode,
                    ErrorMessage = ex.Message
                };
                await httpContext.Response.WriteAsJsonAsync(Response);
            }
        }
    }
}
