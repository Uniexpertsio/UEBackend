const router = require("express").Router();
const controllers = {
	auth: require("../controllers/Auth"),
	
};
let adminAccessible = ["/admin/*"];
let renderOnly = ["/render/*"];
let remoteRender = ["/remote-render/*"];

let requests = {};

requests.apiPrefix = "";
let checkJWT = [];

requests.get = {
	/** Authentication (Endpoints which does not require any authorization token) */
	"/auth/check-reset-token/:token": controllers.auth.get.checkresettoken,
	"/auth/hashpassword/:password": controllers.auth.get.hashpassword
};

requests.post = {
	/** Authentication (Endpoints which does not require any authorization token) */
	"/auth/login": controllers.auth.post.login,
	"/auth/register": controllers.auth.post.register,
	"/auth/forgot-password": controllers.auth.post.forgotPassword,
};

requests.put = {
	
};

requests.patch = {
	
};

requests.delete = {
	
};

for (let key in requests) {
	if (typeof requests[key] !== "object") continue;
	for (let ep in requests[key]) {
		if (!ep.startsWith("/admin/") && !ep.startsWith("/auth/") && !ep.startsWith("/no-auth/") && !ep.startsWith("/render/") && !ep.startsWith("/remote-render/")) {
			checkJWT.push(requests.apiPrefix.concat(ep));
		}
	}
}
checkJWT = [...new Set(checkJWT)]; // to remove duplicates

router.use(controllers.index);
router.use(controllers.middleware.addRequestTime);
router.use(adminAccessible, (req, res, next) => {
	controllers.middleware.checkAuth(req, res, next, true);
});

router.use(checkJWT, (req, res, next) => {
	controllers.middleware.checkAuth(req, res, next, false);
});

router.use(renderOnly, controllers.middleware.checkRenderAccess);
router.use(remoteRender, controllers.middleware.remoteRenderAccess);

for (let url in requests.get) {
	if (!requests.get[url]) {
		console.log("!!!", url);
	}
	router.route(requests.apiPrefix.concat(url)).get(requests.get[url]);
}

for (let endpoint in requests.post) {
	if (!requests.post[endpoint]) {
		console.log("!!!", endpoint);
	}
	router.route(requests.apiPrefix.concat(endpoint)).post(requests.post[endpoint]);
}

for (let endpoint in requests.put) {
	router.route(requests.apiPrefix.concat(endpoint)).put(requests.put[endpoint]);
}

for (let endpoint in requests.patch) {
	router.route(requests.apiPrefix.concat(endpoint)).patch(requests.patch[endpoint]);
}

for (let endpoint in requests.delete) {
	router.route(requests.apiPrefix.concat(endpoint)).delete(requests.delete[endpoint]);
}

module.exports = router;
