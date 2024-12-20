const app = Vue.createApp({
  data() {
    return {
      hotelId: null,
      templateId: 1,
      title: "Site Name",
      email: "Site email",
      phoneNumber: "Site phone number",
      address: "Site address",
      realImages: [],

      mapIframeHtml: `<div style="max-width:100%;overflow:hidden;color:red;height:400px;"><div id="display-google-map" style="height:100%; width:100%;max-width:100%;"><iframe style="height:100%;width:100%;border:0;" frameborder="0" src="https://www.google.com/maps/embed/v1/place?q=hillroost&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8"></iframe></div><a class="from-embedmap-code" href="https://www.bootstrapskins.com/themes" id="auth-map-data">premium bootstrap themes</a><style>#display-google-map img.text-marker{max-width:none!important;background:none!important;}img{max-width:none}</style></div>`,

      aboutUsImages: [
        { src: "img/about-1.jpg", alt: "About Us Image 1" },
        { src: "img/about-2.jpg", alt: "About Us Image 2" },
        { src: "img/about-3.jpg", alt: "About Us Image 3" },
        { src: "img/about-4.jpg", alt: "About Us Image 4" },
      ],

      carouselImages: [
        {
          src: "img/carousel-1.jpg",
          alt: "Carousel Image 1",
          carouselTitle: "Luxury Living",
          carouselDescription: "A luxury tourist residence...",
        },
        {
          src: "img/carousel-2.jpg",
          alt: "Carousel Image 2",
          carouselTitle: "Luxury Living",
          carouselDescription: "A luxury tourist residence...",
        },
      ],

      description:
        "Hill Roost is located in Kandy, the most beautiful city in central Sri Lanka. We are at Ampitiya-Kandy road, about 3km away from the Kandy City Center. We are very close to the major tourist attractions of the city like the Temple of the Tooth, Kandy Lake, restaurants, and shopping areas.Kandy is the last kingdom of ancient Sri Lanka, and it is full of cultural, traditional,<br><br> and historical values to explore. Geographically, Kandy is a plateau located in the central highlands of Sri Lanka, surrounded by magnificent mountains. This provides beautiful landscapes, mountain views, and a pleasant climate, attracting millions of tourists every year.Hill Roost is more like a home for your stay in Kandy, offering luxury accommodation with<br><br> a unique boutique hotel concept. Hill Roost has 5 bedrooms with large common areas including lobbies, sitting areas, ",

      attraction: "WITHIN KANDY CITY",
      attractionList: [],
      footerDescription: "Edit Footer Description",
      newAttractionTitle: "",
      newAttractionDescription: "",
      newAttractionImage: null,

      isLoading: null,
      isError: null,
      isSuccess: null,
    };
  },
  methods: {
    async loadSiteDetails() {
      this.isLoading = "Loading site data...";

      try {
        const response = await fetch(
          `https://be-publish.ceyinfo.cloud/site-details?hotelId=${this.hotelId}&templateId=${this.templateId}`
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error loading site details:", errorText);
          this.isLoading = null;
          this.isError = "Error loading site details";
          setTimeout(() => {
            this.isError = null;
          }, 5000);
        } else {
          const siteDetails = await response.json();
          console.log("Site details loaded successfully:", siteDetails);
          // this.title = siteDetails.details.title;
          // this.email = siteDetails.details.email;
          // this.phoneNumber = siteDetails.details.phoneNumber;
          this.aboutUsImages = siteDetails.details.aboutUsImages;
          this.carouselImages = siteDetails?.details?.carouselImages;
          this.description = siteDetails?.details?.description;
          this.realImages = siteDetails?.details?.realImages;
          // this.address = siteDetails?.details?.address;
          this.mapIframeHtml = siteDetails?.details?.mapIframeHtml;
          this.attraction = siteDetails?.details?.attraction;
          this.attractionList = siteDetails?.details?.attractionList || [];
          this.footerDescription =
            siteDetails?.details?.footerDescription || this.footerDescription;

          this.isLoading = null;
          this.isSuccess = "Site details loaded successfully";
          setTimeout(() => {
            this.isSuccess = null;
          }, 5000);
        }
      } catch (error) {
        console.error("Error fetching site details:", error);
        // this.isLoading = null;
        // this.isError = "Error fetching site details";
        // setTimeout(() => {
        //   this.isError = null;
        // }, 5000);
      }
    },
    triggerFileInput() {
      document.getElementById("file").click();
    },
    async handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.newAttractionImage = await this.convertToBase64(file);
      }
    },

    async convertToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
    },

    async addAttraction() {
      if (
        this.newAttractionTitle &&
        this.newAttractionDescription &&
        this.newAttractionImage
      ) {
        this.attractionList.push({
          title: this.newAttractionTitle,
          description: this.newAttractionDescription,
          image: this.newAttractionImage,
        });

        this.newAttractionTitle = "";
        this.newAttractionDescription = "";
        this.newAttractionImage = null;
        document.getElementById("file").value = "";

        await this.saveDetails();
      } else {
        alert("Please fill in all fields and upload an image.");
      }
    },
    async saveDetails() {
      this.isLoading = "Saving...";
      const details = {
        hotelId: this.hotelId,
        templateId: this.templateId,
        title: this.title,
        email: this.email,
        phoneNumber: this.phoneNumber,
        aboutUsImages: this.aboutUsImages,
        carouselImages: this.carouselImages,
        description: this.description,
        realImages: this.realImages,
        address: this.address,
        mapIframeHtml: this.mapIframeHtml,
        attraction: this.attraction,
        attractionList: this.attractionList,
      };

      try {
        const response = await fetch(
          "https://be-publish.ceyinfo.cloud/save-site-details",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(details),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error saving details:", errorText);
          this.isLoading = null;
          this.isError = "Error saving details";
          setTimeout(() => {
            this.isError = null;
          }, 5000);
        } else {
          const result = await response.json();
          console.log("Details saved successfully:", result);
          this.isLoading = null;
          this.isSuccess = "Details saved successfully";
          setTimeout(() => {
            this.isSuccess = null;
          }, 5000);
        }
      } catch (error) {
        console.error("Error saving details:", error);
        this.isLoading = null;
        this.isError = "Error saving details";
        setTimeout(() => {
          this.isError = null;
        }, 5000);
      }
    },
    removeAttraction(index) {
      try {
        this.attractionList.splice(index, 1);
        this.saveDetails();
      } catch (error) {
        console.error("Error removing attraction:", error);
      }
    },
    async hotelInfo() {
      try {
        const response = await fetch(
          `https://be-publish.ceyinfo.cloud/hotel-info?hotelId=${this.hotelId}`
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error fetching hotel info:", errorText);
        } else {
          const result = await response.json();
          console.log("Hotel info fetched successfully:", result);

          if (result) {
            this.title = result.data.name;
            this.email = result.data.email;
            this.phoneNumber = result.data.mobile;
            this.address = result.data.address1;
          }
        }
      } catch (error) {
        console.error("Error fetching hotel info:", error);
      }
    },
  },
  mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    this.hotelId = urlParams.get("hotelId");

    if (
      !this.hotelId ||
      this.hotelId == "" ||
      this.hotelId == "null" ||
      this.hotelId == "undefined"
    ) {
      alert("Hotel ID not found in URL parameters.");
      window.location.href = "https://entry.ceyinfo.cloud";
    } else {
      this.loadSiteDetails();
      this.hotelInfo();
    }
  },
});

app.mount("#attraction");
