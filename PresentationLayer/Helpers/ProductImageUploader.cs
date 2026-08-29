using DomainLayre.Exceptions;
using DomainLayre.Models;
using Microsoft.AspNetCore.Http;
using static System.Net.Mime.MediaTypeNames;

namespace PresentationLayer.Helpers
{
    public static class ProductImageUploader
    {
        private static readonly HashSet<string> AllowedExtensions =
            new(StringComparer.OrdinalIgnoreCase) { ".jpg", ".jpeg", ".png", ".webp", ".gif" };

        private const long MaxFileSizeBytes = 5 * 1024 * 1024;

        public static async Task<string> SaveAsync(IFormFile file, string webRootPath)
        {
            ValidateFile(file);
            return await SaveValidatedFileAsync(file, webRootPath);
        }

        public static async Task<List<string>> SaveManyAsync(IEnumerable<IFormFile> files, string webRootPath)
        {
            var fileList = files?.Where(f => f is not null && f.Length > 0).ToList() ?? [];

            if (fileList.Count == 0)
                throw new BadRequestException(["At least one product image is required"]);

            var savedPaths = new List<string>();
            foreach (var file in fileList)
            {
                ValidateFile(file);
                savedPaths.Add(await SaveValidatedFileAsync(file, webRootPath));
            }

            return savedPaths;
        }

        private static void ValidateFile(IFormFile file)
        {
            if (file is null || file.Length == 0)
                throw new BadRequestException(["Product image is required"]);

            if (file.Length > MaxFileSizeBytes)
                throw new BadRequestException(["Image size must not exceed 5 MB"]);

            var extension = Path.GetExtension(file.FileName);
            if (string.IsNullOrWhiteSpace(extension) || !AllowedExtensions.Contains(extension))
                throw new BadRequestException(["Invalid image type. Allowed: jpg, jpeg, png, webp, gif"]);
        }

        private static async Task<string> SaveValidatedFileAsync(IFormFile file, string webRootPath)
        {
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();//???? ?? ????? ??? ????????? ?????? ??????? jpg 
            var fileName = $"{Guid.NewGuid()}{extension}";//???? ?? ??? ????? ???? Guid
                                                         //????? ????? ?? ???? ??? ??? ???? ?????? ??????? ???? ?????? ??? ??? ????? 
            var directory = Path.Combine(webRootPath, "images", "products");//?? ?????? ??? ???? ??? ??????? ????  ?????????
                                                                            //C:\Projects\MyStore\wwwroot\images\products
            Directory.CreateDirectory(directory);//?? ??? folder ?? ?????? ?????.

            var fullPath = Path.Combine(directory, fileName);//directory =C:\Projects\MyStore\wwwroot\images\products
                                                             //fileName =abc123.jpg
                                                             //fullPath =C:\Projects\MyStore\wwwroot\images\products\abc123.jpg
                    await using var stream = new FileStream(fullPath, FileMode.Create);//
            await file.CopyToAsync(stream);

            return $"/images/products/{fileName}";
        }
    }
}
