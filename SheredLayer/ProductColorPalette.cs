using System.Linq.Expressions;

namespace SheredLayer
{
    public static class ProductColorPalette
    {
        public static readonly string[] Keys =
        [
            "cream", "sage", "teal", "blue", "yellow", "pink", "black"
        ];

        private static readonly Dictionary<string, string[]> Keywords = new(StringComparer.OrdinalIgnoreCase)
        {
            ["cream"] = ["cream", "ivory", "beige", "ecru", "linen", "off-white", "offwhite", "white", "natural"],
            ["sage"] = ["sage", "green", "olive", "mint", "forest"],
            ["teal"] = ["teal", "turquoise", "aqua"],
            ["blue"] = ["blue", "navy", "ocean", "sky", "indigo"],
            ["yellow"] = ["yellow", "lemon", "gold", "mustard"],
            ["pink"] = ["pink", "blush", "rose", "lavender", "peach", "coral", "dusty"],
            ["black"] = ["black", "charcoal", "onyx", "ebony"]
        };

        public static string[] KeywordsFor(string? colorKey)
        {
            if (string.IsNullOrWhiteSpace(colorKey))
                return [];

            var canonical = Canonical(colorKey);
            if (canonical is null)
                return [];

            return Keywords.TryGetValue(canonical, out var words) ? words : [canonical];
        }

        /// <summary>Maps UI/API color values (and aliases) to the stored palette key, or null if none.</summary>
        public static string? Canonical(string? color)
        {
            if (string.IsNullOrWhiteSpace(color))
                return null;

            var value = color.Trim().ToLowerInvariant();
            if (Keys.Contains(value))
                return value;

            foreach (var pair in Keywords)
            {
                if (pair.Value.Any(word => word == value))
                    return pair.Key;
            }

            return value;
        }

        public static string Resolve(string? storedColor, string? name, string? description)
        {
            var fromStored = Canonical(storedColor);
            if (!string.IsNullOrWhiteSpace(fromStored) && Keys.Contains(fromStored))
                return fromStored;

            var haystack = $"{name} {description}".ToLowerInvariant();
            foreach (var key in Keys)
            {
                if (Keywords[key].Any(word => haystack.Contains(word)))
                    return key;
            }

            return string.Empty;
        }
    }
}
