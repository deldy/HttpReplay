﻿using System;
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
        public ActionResult Index()
        {
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

            var id = DateTime.Now.Ticks;
            var info = new CapturedRequestInfo() {
                Id = id,
                DateRequested = DateTime.Now.ToString("G", new CultureInfo("da-DK")),
                UserHostName = Request.UserHostName,
                Parameters = ToDictionary(Request.Form).ToArray(),
                Raw = Request.Form.ToString(),
                Url = "/" + url,
                Encoding = Request.ContentEncoding.EncodingName.ToString(),
                HttpMethod = Request.HttpMethod
            };

            var json = JsonConvert.SerializeObject(info);

            var fileName = id + ".json";

            System.IO.File.WriteAllText(Path.Combine(basePath, fileName), json);

            return Content("OK");
        }

        private string GetBasePath()
        {
            return Server.MapPath("~/App_Data/CapturedRequests");
        }

        public static Dictionary<string, string> ToDictionary(NameValueCollection col)
        {
            var dict = new Dictionary<string, string>();

            foreach (var key in col.Keys) {
                dict.Add((string)key, col[(string)key]);
            }

            return dict;
        }
    }

    public class CapturedRequestInfo
    {
        public long Id { get; set; }
        public string UserHostName { get; set; }
        public KeyValuePair<string, string>[] Parameters { get; set; }
        public string DateRequested { get; set; }
        public string Raw { get; set; }
        public string Url { get; set; }
        public string Encoding { get; set; }
        public string HttpMethod { get; set; }
    }
}