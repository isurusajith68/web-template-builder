const app = Vue.createApp({
  data() {
    return {
      hotelId: null,
      templateId: 1, // Template ID
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

      isEditingCarouselImages: false,
      isEditingAboutUsImages: false,
      isEditingTitle: false,
      isEditingEmail: false,
      isEditingPhoneNumber: false,
      isEditingDescription: false,

      isEditingCarouselTitle: false,
      isEditingCarouselDescription: false,

      editCarouselText: [
        {
          isEditingCarouselTitle: false,
          isEditingCarouselDescription: false,
        },
        {
          isEditingCarouselTitle: false,
          isEditingCarouselDescription: false,
        },
      ],

      editCarouselImages: [
        { src: "", alt: "", carouselTitle: "", carouselDescription: "" },
        { src: "", alt: "", carouselTitle: "", carouselDescription: "" },
      ],

      editAboutUsImages: [
        { src: "", alt: "" },
        { src: "", alt: "" },
        { src: "", alt: "" },
        { src: "", alt: "" },
      ],

      aboutImgStyle: [
        {
          width: "w-75",
          style: "margin-top: 25%;",
          end: "text-end",
        },
        {
          width: "w-100",
          end: "text-start",
        },
        {
          width: "w-50",
          end: "text-end",
        },
        {
          width: "w-75",
          end: "text-start",
        },
      ],

      editTitle: "",
      editEmail: "",
      editPhoneNumber: "",
      editDescription: "",

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

    async publishChanges() {
      this.isLoading = "Publishing...";

      try {
        const response = await fetch(
          `https://be-publish.ceyinfo.cloud/build-template?hotelId=${this.hotelId}&templateId=${this.templateId}`
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error publishing changes:", errorText);
          this.isLoading = null;
          this.isError = "Error publishing changes";
          setTimeout(() => {
            this.isError = null;
          }, 5000);
        } else {
          const result = await response.json();
          console.log("Changes published successfully:", result);

          this.isLoading = null;
          this.isSuccess = "Changes published successfully";
          setTimeout(() => {
            this.isSuccess = null;
          }, 5000);
        }
      } catch (error) {
        console.error("Error publishing changes:", error);
        this.isLoading = null;
        this.isError = "Error publishing changes";
        setTimeout(() => {
          this.isError = null;
        }, 5000);
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
            this.title = result.name;
            this.email = result.email;
            this.phoneNumber = result.mobile;
            this.address = result.address1;
          }
        }
      } catch (error) {
        console.error("Error fetching hotel info:", error);
      }
    },

    editClickCarouselImage(index) {
      this.isEditingCarouselImages = true;

      this.editCarouselImages[index].src = this.carouselImages[index].src;
      this.editCarouselImages[index].alt = this.carouselImages[index].alt;
    },

    triggerCarouselImageFileInput(index) {
      const fileInput = this.$refs[`fileInput${index}`];
      if (fileInput) {
        fileInput.click();
      } else {
        console.error(`File input ref for index ${index} not found.`);
      }
    },

    saveCarouselChanges() {
      this.isEditingCarouselImages = false;
    },

    handleFileUploadCarouselImage(event, index) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();

        reader.onload = (e) => {
          this.carouselImages[index].src = e.target.result;
          console.log("Image uploaded successfully:", e.target.result);
        };

        reader.readAsDataURL(file);
      } else {
        console.log("No file selected.");
      }
    },

    editClickTitle() {
      this.isEditingTitle = true;
      this.editTitle = this.title;
    },
    updateTitle() {
      this.title = this.editTitle;
      this.isEditingTitle = false;
    },

    editClickEmail() {
      this.isEditingEmail = true;
      this.editEmail = this.email;
    },

    editAboutUsImage() {
      this.isEditingAboutUsImages = true;
      console.log("clicked");
    },

    updateEmail() {
      this.email = this.editEmail;
      this.isEditingEmail = false;
    },

    editClickPhoneNumber() {
      this.isEditingPhoneNumber = true;
      this.editPhoneNumber = this.phoneNumber;
    },

    updatePhoneNumber() {
      this.phoneNumber = this.editPhoneNumber;
      this.isEditingPhoneNumber = false;
    },

    triggerFileInput(index) {
      const fileInput = this.$refs["fileInput" + index];
      if (fileInput) {
        fileInput.click();
      } else {
        console.error(`File input for index ${index} not found.`);
      }
    },

    handleFileUpload(event, index) {
      console.log("index:", index);
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();

        reader.onload = (e) => {
          this.aboutUsImages[index].src = e.target.result;
          console.log("Image uploaded successfully:", e.target.result);
        };

        reader.readAsDataURL(file);
      } else {
        console.log("No file selected.");
      }
    },

    saveEditedImages() {
      console.log("Changes saved successfully:", this.aboutUsImages);
      this.saveDetails();

      this.isEditingAboutUsImages = false;
    },

    cancelEditing() {
      this.isEditingAboutUsImages = false;
    },

    editClickCarouselTitle(index) {
      this.editCarouselText[index].isEditingCarouselTitle = true;

      this.editCarouselImages[index].carouselTitle =
        this.carouselImages[index].carouselTitle;
    },

    updateCarouselTitle(index) {
      this.carouselImages[index].carouselTitle =
        this.editCarouselImages[index].carouselTitle;

      this.editCarouselText[index].isEditingCarouselTitle = false;
    },

    editClickCarouselDescription(index) {
      this.editCarouselText[index].isEditingCarouselDescription = true;

      this.editCarouselImages[index].carouselDescription =
        this.carouselImages[index].carouselDescription;
    },

    updateCarouselDescription(index) {
      this.carouselImages[index].carouselDescription =
        this.editCarouselImages[index].carouselDescription;

      this.editCarouselText[index].isEditingCarouselDescription = false;
    },

    cancelCarouselEditing() {
      this.isEditingCarouselImages = false;
    },

    editDescriptionClick() {
      this.isEditingDescription = true;
      this.editDescription = this.description.replace(/<br\s*\/?>/gi, "\n");

      console.log("clicked");
    },

    updateDescription() {
      this.description = this.editDescription.replace(/\n/g, "<br>");
      this.isEditingDescription = false;

      console.log(this.editDescription);
    },

    cancelEditingDescription() {
      this.isEditingDescription = false;
    },

    mapSrc() {
      return this.mapIframeHtml;
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
      window.location.href = "https://admin.ceyinfo.cloud";
    } else {
      this.loadSiteDetails();
      this.hotelInfo();
    }
  },
});
app.mount("#app");
