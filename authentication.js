(function () {
    const cognitoDomain = "ap-southeast-2oe66r4s7y.auth.ap-southeast-2.amazoncognito.com";
    const clientId = "6mpavt9nh6dad8s9p180ebcufq";
    const redirectUri = "https://stephan-parra.github.io/sample-sg-road-data/index.html";
  
    const accessToken = localStorage.getItem("access_token");
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
  
    // 🔐 Redirect to Cognito login if not logged in and no auth code is present
    if (!accessToken && !code) {
      const loginUrl = `https://${cognitoDomain}/login?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
      window.location.href = loginUrl;
      return;
    }
  
    // 🔁 Handle OAuth2 code returned by Cognito after login
    if (code && !accessToken) {
      const data = {
        grant_type: "authorization_code",
        client_id: clientId,
        code: code,
        redirect_uri: redirectUri
      };
  
      const formBody = Object.entries(data)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join("&");
  
      fetch(`https://${cognitoDomain}/oauth2/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formBody
      })
        .then(response => response.json())
        .then(tokens => {
          if (tokens.access_token) {
            localStorage.setItem("access_token", tokens.access_token);
            localStorage.setItem("id_token", tokens.id_token);
            console.log("✅ Login successful");
  
            // Clean up ?code=... from URL
            window.history.replaceState({}, document.title, window.location.pathname);
  
            // ✅ Show app after login
            document.getElementById("app").style.display = "block";
  
            // ✅ Force reflow and fix map controls
            requestAnimationFrame(() => {
              if (window.map && typeof window.map.resize === "function") {
                window.map.resize();
              }
  
              const controls = document.querySelectorAll('.maplibregl-ctrl, .maplibregl-ctrl button, .maplibregl-ctrl-group button');
              controls.forEach(ctrl => {
                ctrl.style.fontFamily = "'Roboto', sans-serif";
                ctrl.style.fontSize = "13px";
                ctrl.style.fontWeight = "500";
              });
            });
          } else {
            console.error("❌ Token exchange failed", tokens);
          }
        })
        .catch(error => {
          console.error("❌ Token exchange error:", error);
        });
    } else if (accessToken) {
      // ✅ Already logged in, show app immediately
      document.addEventListener("DOMContentLoaded", () => {
        document.getElementById("app").style.display = "block";
  
        requestAnimationFrame(() => {
          if (window.map && typeof window.map.resize === "function") {
            window.map.resize();
          }
  
          const controls = document.querySelectorAll('.maplibregl-ctrl, .maplibregl-ctrl button, .maplibregl-ctrl-group button');
          controls.forEach(ctrl => {
            ctrl.style.fontFamily = "'Roboto', sans-serif";
            ctrl.style.fontSize = "13px";
            ctrl.style.fontWeight = "500";
          });
        });
      });
    }
  
    // 🔘 Button listeners
    document.addEventListener("DOMContentLoaded", () => {
      // Login button handler
      const loginBtn = document.getElementById("login-btn");
      if (loginBtn) {
        loginBtn.addEventListener("click", () => {
          const loginUrl = `https://${cognitoDomain}/login?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
          window.location.href = loginUrl;
        });
      }
  
      // Logout button handler
      const logoutBtn = document.getElementById("logout-ico");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          // Clear tokens
          localStorage.removeItem("access_token");
          localStorage.removeItem("id_token");
  
          // Redirect to Cognito logout
          const logoutUrl = `https://${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(redirectUri)}`;
          window.location.href = logoutUrl;
        });
      }
    });
  })();  