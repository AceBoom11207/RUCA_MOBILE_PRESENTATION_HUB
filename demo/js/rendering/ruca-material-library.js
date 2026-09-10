(function rucaBabylonMaterialLibraryModule(global){
  'use strict';

  const VERSION='64B.0.1';

  function clamp(value,minimum=0,maximum=1){
    return Math.max(minimum,Math.min(maximum,Number(value) || 0));
  }

  function color3(B,color,fallback={r:128,g:132,b:136}){
    const source=color && Number.isFinite(Number(color.r)) ? color : fallback;
    return new B.Color3(
      clamp(Number(source.r)/255),
      clamp(Number(source.g)/255),
      clamp(Number(source.b)/255)
    );
  }

  function mix(B,a,b,amount){
    return B.Color3.Lerp(a,b,clamp(amount));
  }

  function build(scene,initialTheme){
    const B=global.BABYLON;
    if(!B) throw new Error('Babylon is required before constructing PASS60 materials');
    const materials={};

    function pbr(name,options={}){
      const material=new B.PBRMaterial(name,scene);
      const targetAnisotropy=clamp(options.anisotropy ?? 0);
      // Only assignments with a verified, non-collapsed UV basis opt in.
      // Babylon derives the tangent frame in its existing PBR shader.
      const directional=options.uvBasis===true && targetAnisotropy>0
        && Boolean(material.anisotropy) && scene.getEngine().getCaps().standardDerivatives;
      material.metallic=options.metallic ?? 1;
      material.roughness=options.roughness ?? .3;
      material.environmentIntensity=options.environmentIntensity ?? .72;
      material.directIntensity=options.directIntensity ?? 1;
      material.microSurface=options.microSurface ?? (1-material.roughness);
      material.emissiveColor=B.Color3.Black();
      material.metadata={
        ...(material.metadata || {}),
        rucaMaterial:{
          targetAnisotropy,
          anisotropyMode:directional ? 'uv-derivative' : 'isotropic',
          requestedRefraction:Boolean(options.refraction),
          refractionMode:options.refraction && !scene.environmentTexture
            ? 'clearcoat-ior-fallback'
            : options.refraction
              ? 'environment-refraction'
              : 'none'
        }
      };
      if(Number.isFinite(options.indexOfRefraction)){
        material.indexOfRefraction=options.indexOfRefraction;
      }
      if(Number.isFinite(options.alpha)){
        material.alpha=options.alpha;
        material.transparencyMode=B.Material.MATERIAL_ALPHABLEND;
        material.useRadianceOverAlpha=true;
        material.useSpecularOverAlpha=true;
      }
      if(options.bumpTexture){
        material.bumpTexture=options.bumpTexture;
        material.bumpTexture.level=options.bumpLevel ?? .12;
      }
      if(material.anisotropy){
        material.anisotropy.isEnabled=Boolean(directional);
        material.anisotropy.intensity=directional ? targetAnisotropy : 0;
      }
      if(material.clearCoat && options.clearCoat){
        material.clearCoat.isEnabled=true;
        material.clearCoat.intensity=options.clearCoat;
        material.clearCoat.roughness=options.clearCoatRoughness ?? .08;
      }
      if(material.subSurface && options.refraction && scene.environmentTexture){
        material.subSurface.isRefractionEnabled=true;
        material.subSurface.indexOfRefraction=options.indexOfRefraction ?? 1.5;
        material.subSurface.refractionIntensity=options.refractionIntensity ?? 1;
        material.subSurface.tintColor=options.tintColor || B.Color3.White();
        material.subSurface.tintColorAtDistance=options.tintDistance ?? 1;
        material.subSurface.minimumThickness=options.minimumThickness ?? .02;
        material.subSurface.maximumThickness=options.maximumThickness ?? .12;
        material.subSurface.useAlbedoToTintRefraction=true;
      }
      return material;
    }

    materials.titanium=pbr('RM_TITANIUM_GRADE5',{
      roughness:.47,
      metallic:.90,
      anisotropy:.12,
      environmentIntensity:.42,
      directIntensity:.72
    });
    materials.brushedSteel=pbr('RM_STEEL_BRUSHED',{
      roughness:.38,
      metallic:.93,
      anisotropy:.40,
      uvBasis:true,
      environmentIntensity:.48,
      directIntensity:.82
    });
    materials.polishedSteel=pbr('RM_STEEL_POLISHED',{
      roughness:.12,
      metallic:.97,
      anisotropy:.08,
      clearCoat:.08,
      clearCoatRoughness:.035,
      environmentIntensity:.62,
      directIntensity:.90
    });
    materials.brass=pbr('RM_BRASS',{
      roughness:.33,
      metallic:.90,
      anisotropy:.32,
      uvBasis:true,
      environmentIntensity:.50,
      directIntensity:.82
    });
    materials.blackOxide=pbr('RM_BLACK_OXIDE',{
      roughness:.62,
      metallic:.72,
      anisotropy:.12,
      environmentIntensity:.18,
      directIntensity:.50
    });
    materials.ruby=pbr('RM_RUBY_JEWEL',{
      roughness:.06,
      metallic:0,
      clearCoat:1,
      clearCoatRoughness:.02,
      environmentIntensity:.80,
      directIntensity:.86,
      indexOfRefraction:1.76,
      alpha:.96,
      refraction:true,
      refractionIntensity:.72,
      tintColor:new B.Color3(.42,.008,.018),
      tintDistance:.42,
      minimumThickness:.01,
      maximumThickness:.13
    });
    materials.smokedSapphire=pbr('RM_SMOKED_SAPPHIRE',{
      roughness:.04,
      metallic:0,
      clearCoat:1,
      clearCoatRoughness:.012,
      environmentIntensity:.72,
      directIntensity:.82,
      indexOfRefraction:1.77,
      alpha:.10,
      refraction:true,
      refractionIntensity:.86,
      tintColor:new B.Color3(.025,.055,.068),
      tintDistance:.72,
      minimumThickness:.015,
      maximumThickness:.10
    });
    materials.conduitSteel=pbr('RM_CONDUIT_STEEL',{
      roughness:.35,
      metallic:.94,
      anisotropy:.96,
      environmentIntensity:.50,
      directIntensity:.82
    });
    materials.screwSteel=pbr('RM_FASTENER_STEEL',{
      roughness:.12,
      metallic:.97,
      anisotropy:.08,
      uvBasis:true,
      clearCoat:.08,
      clearCoatRoughness:.035,
      environmentIntensity:.62,
      directIntensity:.90
    });
    materials.gearSteel=pbr('RM_GEAR_STEEL',{
      roughness:.28,
      metallic:.94,
      anisotropy:.28,
      uvBasis:true,
      environmentIntensity:.52,
      directIntensity:.84
    });
    materials.gearTitanium=pbr('RM_GEAR_TITANIUM',{
      roughness:.47,
      metallic:.90,
      anisotropy:.12,
      environmentIntensity:.42,
      directIntensity:.72
    });

    let themeRevision=-1;
    let lastActivity=0;
    function update(theme,revision=0){
      if(revision===themeRevision) return false;
      themeRevision=revision;
      const background=color3(B,theme?.background,{r:3,g:4,b:5});
      const housing=color3(B,theme?.housing,{r:16,g:20,b:23});
      const bezel=color3(B,theme?.bezel,{r:142,g:151,b:155});
      const screws=color3(B,theme?.screws,{r:127,g:136,b:140});
      const mechanical=color3(B,theme?.mechanical,{r:197,g:204,b:207});
      const gears=color3(B,theme?.gears,{r:188,g:152,b:71});
      const jewels=color3(B,theme?.jewels,{r:204,g:20,b:42});
      const glass=color3(B,theme?.glass,{r:5,g:10,b:13});
      const text=color3(B,theme?.text,{r:241,g:244,b:245});

      materials.titanium.albedoColor=mix(B,new B.Color3(.13,.15,.16),bezel,.34);
      materials.titanium.reflectivityColor=mix(B,new B.Color3(.34,.37,.39),mechanical,.30);
      materials.brushedSteel.albedoColor=mix(B,new B.Color3(.28,.31,.33),mechanical,.42);
      materials.brushedSteel.reflectivityColor=mix(B,new B.Color3(.52,.56,.59),text,.06);
      materials.polishedSteel.albedoColor=mix(B,new B.Color3(.47,.50,.52),mechanical,.38);
      materials.polishedSteel.reflectivityColor=mix(B,new B.Color3(.78,.81,.83),text,.06);
      materials.brass.albedoColor=mix(B,new B.Color3(.40,.22,.045),gears,.58);
      materials.brass.reflectivityColor=mix(B,new B.Color3(.58,.34,.08),text,.05);
      materials.blackOxide.albedoColor=mix(B,new B.Color3(.012,.016,.019),housing,.36);
      materials.blackOxide.reflectivityColor=mix(B,new B.Color3(.035,.041,.045),bezel,.06);
      materials.ruby.albedoColor=mix(B,new B.Color3(.32,.002,.010),jewels,.52);
      materials.ruby.reflectivityColor=mix(B,new B.Color3(.94,.80,.82),text,.05);
      materials.smokedSapphire.albedoColor=mix(B,new B.Color3(.012,.030,.040),glass,.38);
      materials.smokedSapphire.reflectivityColor=mix(B,new B.Color3(.68,.76,.80),text,.05);
      materials.conduitSteel.albedoColor=mix(B,new B.Color3(.31,.34,.36),mechanical,.34);
      materials.conduitSteel.reflectivityColor=mix(B,new B.Color3(.58,.62,.65),text,.06);
      materials.screwSteel.albedoColor=mix(B,new B.Color3(.47,.50,.52),screws,.62);
      materials.screwSteel.reflectivityColor=mix(B,new B.Color3(.78,.81,.83),text,.06);
      materials.gearSteel.albedoColor=mix(B,new B.Color3(.34,.37,.39),gears,.58);
      materials.gearSteel.reflectivityColor=mix(B,new B.Color3(.62,.66,.69),text,.05);
      materials.gearTitanium.albedoColor=mix(B,new B.Color3(.13,.15,.16),gears,.52);
      materials.gearTitanium.reflectivityColor=mix(B,new B.Color3(.34,.37,.39),text,.05);
      Object.values(materials).forEach(material=>{
        material.emissiveColor.copyFromFloats(0,0,0);
      });
      return true;
    }

    update(initialTheme,0);

    function setActivity(value){
      lastActivity=clamp(value);
    }

    function dispose(){
      Object.values(materials).forEach(material=>material.dispose());
    }

    return Object.freeze({
      version:VERSION,
      materials,
      update,
      setActivity,
      dispose,
      getState:()=>({
        version:VERSION,
        themeRevision,
        lastActivity:Number(lastActivity.toFixed(4)),
        materials:Object.keys(materials),
        sharedMaterialCount:Object.keys(materials).length,
        directionalNormalTextures:0,
        opticalResponse:Object.fromEntries(Object.entries(materials).map(([key,material])=>[
          key,
          {
            albedo:material.albedoColor
              ? [material.albedoColor.r,material.albedoColor.g,material.albedoColor.b]
                .map(value=>Number(value.toFixed(4)))
              : [],
            metallic:Number(Number(material.metallic || 0).toFixed(3)),
            roughness:Number(Number(material.roughness || 0).toFixed(3)),
            anisotropy:material.anisotropy?.isEnabled
              ? Number(Number(material.anisotropy.intensity || 0).toFixed(3))
              : 0,
            targetAnisotropy:Number(Number(
              material.metadata?.rucaMaterial?.targetAnisotropy || 0
            ).toFixed(3)),
            anisotropyMode:material.metadata?.rucaMaterial?.anisotropyMode || 'none',
            clearCoat:material.clearCoat?.isEnabled
              ? Number(Number(material.clearCoat.intensity || 0).toFixed(3))
              : 0,
            alpha:Number(Number(material.alpha ?? 1).toFixed(3)),
            indexOfRefraction:Number(Number(
              material.subSurface?.isRefractionEnabled
                ? material.subSurface.indexOfRefraction
                : material.indexOfRefraction || 1
            ).toFixed(3)),
            refraction:material.subSurface?.isRefractionEnabled===true,
            refractionMode:material.metadata?.rucaMaterial?.refractionMode || 'none',
            environmentIntensity:Number(Number(material.environmentIntensity || 0).toFixed(3)),
            emissive:material.emissiveColor
              ? [material.emissiveColor.r,material.emissiveColor.g,material.emissiveColor.b]
                .map(value=>Number(value.toFixed(4)))
              : []
          }
        ]))
      })
    });
  }

  global.RUCA_BABYLON_MATERIAL_LIBRARY=Object.freeze({version:VERSION,build});
})(window);
