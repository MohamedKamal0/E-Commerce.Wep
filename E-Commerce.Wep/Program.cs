using DomainLayre.Contracts;
using E_Commerce.Wep.CustomMiddleWares;
using E_Commerce.Wep.Factories;
using InfrastructureLayer.Data;
using InfrastructureLayer.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ServiceLayer;
using ServiceLayer.Mapping;
using ServiceLayerAbstraction;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<AppDbContext>(option =>
{
    option.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnstring"));
});
builder.Services.AddAutoMapper(typeof(ProductProfile).Assembly);
builder.Services.AddScoped<IUnitOfWorke, UnitOfWorke>();
builder.Services.AddScoped<IBasketRepository, BasketRepository>();
//builder.Services.AddScoped<IBasketService, BasketService>();
builder.Services.AddSingleton<IConnectionMultiplexer>
    (ConnectionMultiplexer.Connect(builder.Configuration.GetConnectionString("RedisConnstring")));
builder.Services.AddScoped<IServiceManger, ServiceManger>();

builder.Services.Configure<ApiBehaviorOptions>((Options) =>
{
    Options.InvalidModelStateResponseFactory = ApiResponseFactory.GeneraitapiValidationErorreResponse;
});
var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseMiddleware<CustomExceptipnHandlerMiddleWare>();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
