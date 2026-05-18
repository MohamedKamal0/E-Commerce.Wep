using DomainLayre.Contracts;
using InfrastructureLayer.Data;
using InfrastructureLayer.Repositories;
using Microsoft.EntityFrameworkCore;
using ServiceLayer;
using ServiceLayer.Mapping;
using ServiceLayerAbstraction;

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
builder.Services.AddScoped<IServiceManger, ServiceManger>();
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
