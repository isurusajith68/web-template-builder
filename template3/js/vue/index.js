const app = Vue.createApp({
  data() {
    return {
      hotelId: 24,
      templateId: 3,
      title: "Click to edit site name",
      address: "No 12, Colombo Road, Colombo 03",
      phoneNumber: "0765280144",
      email: "isurusajith68@gmail.com",
      headerTitle: "Click to edit header title",
      galleryHeaderTitle: "Click to edit header title",
      homeHeaderImage: "img/gallery_1.jpeg",
      galleryHeaderImage: "img/gallery_2.jpeg",
      heroImage: "img/hero_1.jpeg",
      heroDescription:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc nec",

      menuHearderDescription:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Reiciendis ab debitis sit",

      menuTitle1: "Crab with Curry Sources",
      menuDescription1:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc nec",
      menuImage1: "img/gallery_1.jpeg",

      menuTitle2: "Tuna Roast Beef",
      menuDescription2:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc nec",
      menuImage2: "img/gallery_2.jpeg",

      menuTitle3: "Egg with Mushroom",
      menuDescription3:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc nec",
      menuImage3: "img/gallery_3.jpeg",

      reservationDescription:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc nec",

      footerDescription:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc nec",

      editTitle: "",
      editHeaderTitle: "",
      editGalleryHeaderTitle: "",
      editHeroDescription: "",
      editMenuTitle1: "",
      editMenuDescription1: "",
      editMenuTitle2: "",
      editMenuDescription2: "",
      editMenuTitle3: "",
      editMenuDescription3: "",
      editMenuHearderDescription: "",
      editReservationDescription: "",
      editFooterDescription: "",

      isEditingTitle: false,
      isEditingHeaderTitle: false,
      isEditingGalleryHeaderTitle: false,
      isEditingHeroDescription: false,
      isEditingMenuTitle1: false,
      isEditingMenuDescription1: false,
      isEditingMenuTitle2: false,
      isEditingMenuDescription2: false,
      isEditingMenuTitle3: false,
      isEditingMenuDescription3: false,
      isEditingMenuHearderDescription: false,
      isEditingReservationDescription: false,
      isEditingFooterDescription: false,

      isLoading: null,
      isError: null,
      isSuccess: null,
    };
  },
  methods: {
    editClickTitle() {
      this.isEditingTitle = true;

      this.editTitle = this.title;
    },
    updateTitle() {
      if (this.editTitle == "") {
        this.isError = "Please enter a valid title";

        setTimeout(() => {
          this.isError = null;
        }, 3000);

        return;
      }

      if (this.editTitle.length < 5) {
        this.isError = "Title must be at least 5 characters";

        setTimeout(() => {
          this.isError = null;
        }, 3000);

        return;
      }

      this.title = this.editTitle;

      this.isEditingTitle = false;
    },
    editClickGalleryHeaderTitle() {
      this.isEditingGalleryHeaderTitle = true;
      this.editGalleryHeaderTitle = this.galleryHeaderTitle;
    },
    updateGalleryHeaderTitle() {
      if (this.editGalleryHeaderTitle == "") {
        this.isError = "Please enter a valid header title";

        setTimeout(() => {
          this.isError = null;
        }, 3000);

        return;
      }

      this.galleryHeaderTitle = this.editGalleryHeaderTitle;
      this.isEditingGalleryHeaderTitle = false;
    },
    editClickHeaderTitle() {
      this.isEditingHeaderTitle = true;
      this.editHeaderTitle = this.headerTitle;
    },
    updateHeaderTitle() {
      if (this.editHeaderTitle == "") {
        this.isError = "Please enter a valid header title";

        setTimeout(() => {
          this.isError = null;
        }, 3000);

        return;
      }

      this.headerTitle = this.editHeaderTitle;
      this.isEditingHeaderTitle = false;
    },
    editClickHeroDescription() {
      this.isEditingHeroDescription = true;
      this.editHeroDescription = this.heroDescription;
    },
    updateHeroDescription() {
      if (this.editHeroDescription < 5) {
        this.isError = "Please enter a valid  description";

        setTimeout(() => {
          this.isError = null;
        }, 3000);

        return;
      }

      this.heroDescription = this.editHeroDescription;
      this.isEditingHeroDescription = false;
    },
    editClickMenuTitle1() {
      this.isEditingMenuTitle1 = true;
      this.editMenuTitle1 = this.menuTitle1;
    },
    updateMenuTitle1() {
      if (this.editMenuTitle1 == "") {
        this.isError = "Please enter a valid  title";

        setTimeout(() => {
          this.isError = null;
        }, 3000);

        return;
      }

      this.menuTitle1 = this.editMenuTitle1;
      this.isEditingMenuTitle1 = false;
    },
    editClickMenuDescription1() {
      this.isEditingMenuDescription1 = true;
      this.editMenuDescription1 = this.menuDescription1;
    },
    updateMenuDescription1() {
      if (this.editMenuDescription1 < 5) {
        this.isError = "Please enter a valid  description";

        setTimeout(() => {
          this.isError = null;
        }, 3000);

        return;
      }
      this.menuDescription1 = this.editMenuDescription1;
      this.isEditingMenuDescription1 = false;
    },
    editClickMenuTitle2() {
      this.isEditingMenuTitle2 = true;
      this.editMenuTitle2 = this.menuTitle2;
    },
    updateMenuTitle2() {
      if (this.editMenuTitle2 == "") {
        this.isError = "Please enter a valid  title";

        setTimeout(() => {
          this.isError = null;
        }, 3000);

        return;
      }
      this.menuTitle2 = this.editMenuTitle2;
      this.isEditingMenuTitle2 = false;
    },
    editClickMenuDescription2() {
      this.isEditingMenuDescription2 = true;
      this.editMenuDescription2 = this.menuDescription2;
    },
    updateMenuDescription2() {
      if (this.editMenuDescription2 < 5) {
        this.isError = "Please enter a valid  description";

        setTimeout(() => {
          this.isError = null;
        }, 3000);

        return;
      }

      this.menuDescription2 = this.editMenuDescription2;
      this.isEditingMenuDescription2 = false;
    },
    editClickMenuTitle3() {
      this.isEditingMenuTitle3 = true;
      this.editMenuTitle3 = this.menuTitle3;
    },
    updateMenuTitle3() {
      if (this.editMenuTitle3 == "") {
        this.isError = "Please enter a valid  title";

        setTimeout(() => {
          this.isError = null;
        }, 3000);

        return;
      }

      this.menuTitle3 = this.editMenuTitle3;
      this.isEditingMenuTitle3 = false;
    },
    editClickMenuDescription3() {
      this.isEditingMenuDescription3 = true;
      this.editMenuDescription3 = this.menuDescription3;
    },
    updateMenuDescription3() {
      if (this.editMenuDescription3 < 5) {
        this.isError = "Please enter a valid  description";

        setTimeout(() => {
          this.isError = null;
        }, 3000);

        return;
      }
      this.menuDescription3 = this.editMenuDescription3;
      this.isEditingMenuDescription3 = false;
    },
    editClickMenuHearderDescription() {
      this.isEditingMenuHearderDescription = true;
      this.editMenuHearderDescription = this.menuHearderDescription;
    },
    updateMenuHearderDescription() {
      if (this.editMenuHearderDescription < 5) {
        this.isError = "Please enter a valid  description";

        setTimeout(() => {
          this.isError = null;
        }, 3000);

        return;
      }
      this.menuHearderDescription = this.editMenuHearderDescription;
      this.isEditingMenuHearderDescription = false;
    },

    editClickReservationDescription() {
      this.isEditingReservationDescription = true;
      this.editReservationDescription = this.reservationDescription;
    },
    updateReservationDescription() {
      if (this.editReservationDescription < 5) {
        this.isError = "Please enter a valid  description";

        setTimeout(() => {
          this.isError = null;
        }, 3000);

        return;
      }
      this.reservationDescription = this.editReservationDescription;
      this.isEditingReservationDescription = false;
    },

    editClickFooterDescription() {
      this.isEditingFooterDescription = true;
      this.editFooterDescription = this.footerDescription;
    },
    updateFooterDescription() {
      if (this.editFooterDescription < 5) {
        this.isError = "Please enter a valid  description";

        setTimeout(() => {
          this.isError = null;
        }, 3000);
        return;
      }
      this.footerDescription = this.editFooterDescription;
      this.isEditingFooterDescription = false;
    },

    triggerFileInput() {
      this.$refs.fileInput.click();
    },

    triggerHeroImageUpload() {
      this.$refs.heroImage.click();
    },
    triggerMenuImage1Upload() {
      this.$refs.menuImage1.click();
    },

    triggerMenuImage2Upload() {
      this.$refs.menuImage2.click();
    },

    triggerMenuImage3Upload() {
      this.$refs.menuImage3.click();
    },

    triggerGalleryHeaderImageUpload() {
      this.$refs.galleryHeaderImage.click();
    },
    async uploadSingleImage(event, imageType) {
      const file = event.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("imageType", imageType);
        formData.append("hotelId", this.hotelId);
        formData.append("templateId", this.templateId);

        try {
          const response = await fetch(
            "http://localhost:4000/temp3/upload-single",
            {
              method: "POST",
              body: formData,
            }
          );

          const result = await response.json();

          const data = result.details;

          if (data[imageType]) {
            this[imageType] = data[imageType];
          }
          console.log("Image uploaded successfully:", data);
        } catch (error) {
          console.error("Error uploading image:", error);
        }
      }
    },
    // handleFileChange(event) {
    //   const files = event.target.files;
    //   const maxFiles = 5;

    //   if (files.length > maxFiles) {
    //     this.isError = `You can upload a maximum of ${maxFiles} images.`;

    //     setTimeout(() => {
    //       this.isError = null;
    //     }, 5000);
    //     return;
    //   }

    //   const formData = new FormData();

    //   for (let i = 0; i < Math.min(files.length, maxFiles); i++) {
    //     formData.append("images", files[i]);
    //   }

    //   this.uploadImages(formData);
    // },
    // async uploadImages(formData) {
    //   this.isLoading = "Uploading...";

    //   try {
    //     const response = await fetch(
    //       `http://be-publish.ceyinfo.cloud/upload-images?hotelId=${this.hotelId}&templateId=${this.templateId}`,
    //       {
    //         method: "POST",
    //         body: formData,
    //       }
    //     );

    //     if (response.ok) {
    //       const data = await response.json();
    //       console.log("Images uploaded successfully:", data);

    //       this.userUseRealImages = true;
    //       this.realImages = data.images;
    //       console.log("Real images:", this.realImages);

    //       this.isLoading = null;
    //       this.isSuccess = "Images uploaded successfully";

    //       setTimeout(() => {
    //         this.isSuccess = null;
    //       }, 5000);
    //     } else {
    //       const errorText = await response.text();
    //       console.error("Error uploading images:", errorText);

    //       this.isLoading = null;
    //       this.isError = "Error uploading images";

    //       setTimeout(() => {
    //         this.isError = null;
    //       }, 5000);
    //     }
    //   } catch (error) {
    //     console.error("Error uploading images:", error);
    //     this.isLoading = null;
    //     this.isError = "Error uploading images";

    //     setTimeout(() => {
    //       this.isError = null;
    //     }, 5000);
    //   }
    // },
    async loadSiteDetails() {
      this.isLoading = "Loading site data...";

      try {
        const response = await fetch(
          `http://localhost:4000/site-details?hotelId=${this.hotelId}&templateId=${this.templateId}`
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
          this.address = siteDetails.details.address;
          this.phoneNumber = siteDetails.details.phoneNumber;
          this.email = siteDetails.details.email;
          this.headerTitle = siteDetails.details.headerTitle;
          this.homeHeaderImage = siteDetails.details.homeHeaderImage;
          this.heroImage = siteDetails.details.heroImage;
          this.heroDescription = siteDetails.details.heroDescription;
          this.menuHearderDescription =
            siteDetails.details.menuHearderDescription;
          this.menuTitle1 = siteDetails.details.menuTitle1;
          this.menuDescription1 = siteDetails.details.menuDescription1;
          this.menuImage1 = siteDetails.details.menuImage1;
          this.menuTitle2 = siteDetails.details.menuTitle2;
          this.menuDescription2 = siteDetails.details.menuDescription2;
          this.menuImage2 = siteDetails.details.menuImage2;
          this.menuTitle3 = siteDetails.details.menuTitle3;
          this.menuDescription3 = siteDetails.details.menuDescription3;
          this.menuImage3 = siteDetails.details.menuImage3;
          this.reservationDescription =
            siteDetails.details.reservationDescription;
          this.footerDescription = siteDetails.details.footerDescription;
          // this.galleryHeaderTitle = siteDetails.details.galleryHeaderTitle;
          this.galleryHeaderImage = siteDetails.details.galleryHeaderImage;

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
    async saveChanges() {
      const data = {
        hotelId: this.hotelId,
        templateId: this.templateId,
        title: this.title,
        address: this.address,
        phoneNumber: this.phoneNumber,
        email: this.email,
        headerTitle: this.headerTitle,
        homeHeaderImage: this.homeHeaderImage,
        heroImage: this.heroImage,
        heroDescription: this.heroDescription,
        menuHearderDescription: this.menuHearderDescription,
        menuTitle1: this.menuTitle1,
        menuDescription1: this.menuDescription1,
        menuImage1: this.menuImage1,
        menuTitle2: this.menuTitle2,
        menuDescription2: this.menuDescription2,
        menuImage2: this.menuImage2,
        menuTitle3: this.menuTitle3,
        menuDescription3: this.menuDescription3,
        menuImage3: this.menuImage3,
        reservationDescription: this.reservationDescription,
        footerDescription: this.footerDescription,
      };
      this.isLoading = "Saving changes...";
      console.log("Data to save:", data);
      try {
        const response = await fetch(
          "http://localhost:4000/temp3/save-site-details",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          }
        );

        if (response.ok) {
          this.isLoading = null;
          this.isSuccess = "Changes saved successfully";
          setTimeout(() => {
            this.isSuccess = null;
          }, 5000);
        } else {
          this.isLoading = null;
          this.isError = "Failed to save changes";
          setTimeout(() => {
            this.isError = null;
          }, 5000);
        }
      } catch (error) {
        console.error("Failed to save changes", error);
        this.isLoading = null;
        this.isError = "Failed to save changes";
        setTimeout(() => {
          this.isError = null;
        }, 5000);
      }
    },

    async hotelInfo() {
      try {
        const response = await fetch(
          `http://be-publish.ceyinfo.cloud/hotel-info?hotelId=${this.hotelId}`
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error fetching hotel info:", errorText);
        } else {
          const result = await response.json();
          console.log("Hotel info fetched successfully:", result);

          if (result) {
            // this.title = result.name;
            this.email = result.email;
            this.phoneNumber = result.mobile;
            this.address = result.address1;
          }
        }
      } catch (error) {
        console.error("Error fetching hotel info:", error);
      }
    },
    // async publishChanges() {
    //   this.isLoading = "Publishing...";

    //   try {
    //     const response = await fetch(
    //       `http://be-publish.ceyinfo.cloud/temp2/build-template?hotelId=${this.hotelId}&templateId=${this.templateId}`
    //     );

    //     if (!response.ok) {
    //       const errorText = await response.text();
    //       console.error("Error publishing changes:", errorText);
    //       this.isLoading = null;
    //       this.isError = "Error publishing changes";
    //       setTimeout(() => {
    //         this.isError = null;
    //       }, 5000);
    //     } else {
    //       const result = await response.json();
    //       console.log("Changes published successfully:", result);

    //       this.isLoading = null;
    //       this.isSuccess = "Changes published successfully";
    //       setTimeout(() => {
    //         this.isSuccess = null;
    //       }, 5000);
    //     }
    //   } catch (error) {
    //     console.error("Error publishing changes:", error);
    //     this.isLoading = null;
    //     this.isError = "Error publishing changes";
    //     setTimeout(() => {
    //       this.isError = null;
    //     }, 5000);
    //   }
    // },
  },
  mounted() {
    this.loadSiteDetails();
    this.hotelInfo();
  },
});

app.mount("#app");
