using System.Text;
using DomainLayre.Contracts;
using DomainLayre.Models.IdentityModeyol;
using E_Commerce.Wep.CustomMiddleWares;
using E_Commerce.Wep.Factories;
using InfrastructureLayer.Data;
using InfrastructureLayer.DataSeed;
using InfrastructureLayer.Identity;
using InfrastructureLayer.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ServiceLayer;
using ServiceLayer.Mapping;
using ServiceLayerAbstraction;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddDbContext<AppDbContext>(option =>
{
    option.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnstring"));
});
builder.Services.AddDbContext<StoreIdentityDbContext>(option =>
{
    option.UseSqlServer(builder.Configuration.GetConnectionString("IdentityConnstring"));
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

builder.Services.AddAuthentication(ex =>
{
    ex.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    ex.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    ex.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["JWTOptions:Issuer"],

        ValidateAudience = true,
        ValidAudience = builder.Configuration["JWTOptions:Audience"],

        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["JWTOptions:SecretKey"]))
    };

});
builder.Services.AddAuthorization();   // <-- أضف السطر ده
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Enter JWT Token"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});
builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<StoreIdentityDbContext>()
    .AddDefaultTokenProviders();
builder.Services.AddScoped<IDataSeeding, DataSeeding>();
var app = builder.Build();

using var Scope = app.Services.CreateScope();
var ObjectOfDataSeeding = Scope.ServiceProvider.GetRequiredService<IDataSeeding>();
ObjectOfDataSeeding.IdentityDataSeedAsync();

// Configure the HTTP request pipeline.
app.UseMiddleware<CustomExceptipnHandlerMiddleWare>();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseStatusCodePages();
app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
