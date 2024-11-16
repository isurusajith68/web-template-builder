const app = Vue.createApp({
  data() {
    return {
      hotelId: 24,
      templateId: 1,
      title: "Hill Roost",
      email: "hillroostkandy@gmail.com",
      phoneNumber: "0765280144",
      address: "Hill Roost, Kandy, Sri Lanka",
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

      roomsDetails: [],

      isLoading: null,
      isError: null,
      isSuccess: null,
    };
  },
  methods: {
    getAmenityIcon(amenity) {
      if (!amenity) return null;

      switch (amenity.toLowerCase()) {
        case "wifi":
          return "fa-wifi";
        case "tv":
          return "fa-tv";
        case "ac":
          return "fa-snowflake";
        case "balcony":
          return "fa-building";
        default:
          return null;
      }
    },
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
          this.title = siteDetails.details.title;
          this.email = siteDetails.details.email;
          this.phoneNumber = siteDetails.details.phoneNumber;
          this.aboutUsImages = siteDetails.details.aboutUsImages;
          this.carouselImages = siteDetails?.details?.carouselImages;
          this.description = siteDetails?.details?.description;
          this.realImages = siteDetails?.details?.realImages;
          this.address = siteDetails?.details?.address;
          this.mapIframeHtml = siteDetails?.details?.mapIframeHtml;
          this.attraction = siteDetails?.details?.attraction;
          this.attractionList = siteDetails?.details?.attractionList || [];
          this.isLoading = null;
          this.isSuccess = "Site details loaded successfully";
          setTimeout(() => {
            this.isSuccess = null;
          }, 5000);
        }
      } catch (error) {
        console.error("Error fetching site details:", error);
        this.isLoading = null;
        this.isError = "Error fetching site details";
        setTimeout(() => {
          this.isError = null;
        }, 5000);
      }
    },

    async loadRoomDetails() {
      this.isLoading = "Loading room data...";

      try {
        const response = await fetch(
          `https://be-publish.ceyinfo.cloud/rooms-info?hotelId=${this.hotelId}`
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error loading room details:", errorText);
          this.isLoading = null;
          this.isError = "Error loading room details";
          setTimeout(() => {
            this.isError = null;
          }, 5000);
        } else {
          const roomDetails = await response.json();
          console.log("Room details loaded successfully:", roomDetails);
          this.roomsDetails = roomDetails;
          this.isLoading = null;
          this.isSuccess = "Room details loaded successfully";
          setTimeout(() => {
            this.isSuccess = null;
          }, 5000);
        }
      } catch (error) {
        console.error("Error fetching room details:", error);
        this.isLoading = null;
        this.isError = "Error fetching room details";
        setTimeout(() => {
          this.isError = null;
        }, 5000);
      }
    },
  },
  mounted() {
    this.loadSiteDetails();
    this.loadRoomDetails();
    // const urlParams = new URLSearchParams(window.location.search);
    // this.hotelId = urlParams.get("hotelId");
    // this.templateId = urlParams.get("templateId");
    // console.log(this.hotelId, this.templateId);
  },
});

app.mount("#room");
