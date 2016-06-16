using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;
using Newtonsoft.Json;

namespace HttpReplay.Controllers
{

    public class HomeController : Controller
    {
        // GET: Home
        [AllowCrossSiteJson]
        public ActionResult Index()
        {
            var basePath = GetBasePath();
            return View();
        }

        public ActionResult LoadData()
        {
            var files = Directory.GetFiles(GetBasePath(), "*.json").Select(ReadFile);

            var json = JsonConvert.SerializeObject(files.OrderByDescending(x => x.DateRequested));

            return Content(json, "application/json");
        }

        private static CapturedRequestInfo ReadFile(string x)
        {
            var settings = new JsonSerializerSettings();

            settings.DateParseHandling = DateParseHandling.None;
            return JsonConvert.DeserializeObject<CapturedRequestInfo>(System.IO.File.ReadAllText(x), settings);
        }

        [HttpPost]
        public ActionResult DeleteAll()
        {
            var files = Directory.GetFiles(GetBasePath(), "*.json");

            foreach (var file in files) {
                System.IO.File.Delete(file);
            }

            return Content("OK");
        }

        public ActionResult Capture(string url)
        {
            url = url ?? Request.QueryString["url"];
            var basePath = GetBasePath();
            Directory.CreateDirectory(basePath);

            string postedData;
            using (var streamReader = new StreamReader(Request.InputStream)) {
                postedData = streamReader.ReadToEnd();
            }

            var id = DateTime.Now.Ticks;
            var info = new CapturedRequestInfo() {
                Id = id,
                DateRequested = DateTime.Now.ToString("G", new CultureInfo("da-DK")),
                UserHostName = Request.UserHostName,
                QueryString = Request.QueryString.ToString(),
                BodyData = postedData,
                Url = "/" + url,
                Encoding = Request.ContentEncoding.EncodingName.ToString(),
                HttpMethod = Request.HttpMethod,
                Headers = { }
            };
            var headers = new List<HeaderInfo>();
            foreach (var key in Request.Headers.Keys) {
                headers.Add(
                    new HeaderInfo {
                        Name = key.ToString(),
                        Value = Request.Headers.Get(key.ToString())
                    }
                );
            }
            info.Headers = headers.ToArray();

            var json = JsonConvert.SerializeObject(info);

            var fileName = id + ".json";

            try {
                System.IO.File.WriteAllText(Path.Combine(basePath, fileName), json);
            } catch { }

            return new HttpStatusCodeResult(200, "All done");
        }

        private string GetBasePath()
        {
            return Server.MapPath("~/App_Data/CapturedRequests");
        }

    }

    public class HeaderInfo
    {
        public string Name { get; set; }
        public string Value { get; set; }

    }

    public class CapturedRequestInfo
    {
        public long Id { get; set; }
        public string UserHostName { get; set; }
        public string DateRequested { get; set; }
        public string QueryString { get; set; }
        public string BodyData { get; set; }
        public string Url { get; set; }
        public string Encoding { get; set; }
        public HeaderInfo[] Headers { get; set; }
        public string HttpMethod { get; set; }
    }
}