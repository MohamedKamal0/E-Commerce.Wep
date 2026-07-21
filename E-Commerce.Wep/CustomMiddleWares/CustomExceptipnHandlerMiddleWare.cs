
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
                await _next(httpContext);

                if (!httpContext.Response.HasStarted &&
                    httpContext.Response.StatusCode == StatusCodes.Status404NotFound)
                {
                    httpContext.Response.ContentType = "application/json";

                    var response = new ErrorToReturn
                    {
                        StatuseCode = StatusCodes.Status404NotFound,
                        ErrorMessage = $"End Point {httpContext.Request.Path} is not found"
                    };

                    await httpContext.Response.WriteAsJsonAsync(response);
                }

            }
            //هنا انا بضيف كل الارور الي بتطلعلي  علشان تعدي علي المدل وير اي ارور جديد هتضيفه في اكسبشن عندك تيجي تضيفه هنا 
            catch (Exception ex)
            {

                _logger.LogError(ex, "Something Went Wrong");
                var Response = new ErrorToReturn()
                {
                    StatuseCode = httpContext.Response.StatusCode,
                    ErrorMessage = ex.Message
                };
                httpContext.Response.StatusCode = ex switch
                {
                    NotFoundException => StatusCodes.Status404NotFound,
                    UnauthorizedException => StatusCodes.Status401Unauthorized,
                    BadRequestException badRequestException => GetBadRequestErrore(badRequestException, Response),
                    _ => StatusCodes.Status500InternalServerError
                };


                await httpContext.Response.WriteAsJsonAsync(Response);
            }
        }

        private static int GetBadRequestErrore(BadRequestException badRequestException, ErrorToReturn response)
        {
            response.Errores = badRequestException.Errors;
            return StatusCodes.Status400BadRequest;
        }
    }
}
