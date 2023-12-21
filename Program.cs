using System.Net;

namespace handstack_docs
{
    public class Program
    {
        public static void Main(string[] args)
        {
            int port = 8080;
            if (args.Length > 0)
            {
                try
                {
                    port = int.Parse(args[0]);
                }
                catch
                {
                    Console.WriteLine($"매개변수 port 확인 필요");
                }
            }

            var builder = WebApplication.CreateBuilder(args);
            builder.WebHost.UseKestrel(options =>
            {
                options.Listen(IPAddress.Any, port);
            });

            var app = builder.Build();

            string buildPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "wwwroot");
            if (Directory.Exists(buildPath) == true)
            {
                app.UseDefaultFiles(new DefaultFilesOptions
                {
                    DefaultFileNames = new List<string> { "index.html" }
                });

                app.UseStaticFiles();
            }
            else
            {
                Console.WriteLine($"buildPath: {buildPath} 확인 필요");
            }

            app.Run();
        }
    }
}
