import React, { useEffect, useState } from "react";
import axios from "axios";

import { toFirstCharUppercase } from "./constants";

import {
  Typography,
  Button,
  CircularProgress,
  Grid,
  Card,
  CardMedia,
  CardContent,
  LinearProgress,
  Box,
  Divider,
} from "@material-ui/core";

import { makeStyles, withStyles } from "@material-ui/core/styles";

const StatStyles = withStyles((theme) => ({
  root: {
    height: 22,
    borderRadius: 5,
    width: "100%",
  },
  colorPrimary: {
    backgroundColor: "#E8DAFB",
  },
  bar: {
    borderRadius: 5,
    backgroundColor: "#D2B5F7",
  },
}))(LinearProgress);

const useStyles = makeStyles((theme) => ({
  pokemonContainer: {
    margin: "5%",
  },
  cardMedia: {
    margin: "auto",
    textAlign: "center",
  },
  cardContent: {
    textAlign: "center",
  },
  card: {
    paddingLeft: "10px",
    paddingRight: "10px",
  },
  cardNumber: {
    marginLeft: "5px",
    marginTop: "10px",
  },
  cardName: {
    marginLeft: "34%",
    marginTop: "10px",
  },
  backButton: {
    marginLeft: "43%",
    margingTop: "5%",
    marginBottom: "5%",
    marginRignt: "10%",
  },
  statsInBar: {
    paddingLeft: "25px",
  },
  description: {
    padding: "25px",
    textAlign: "center",
  },
  profile: {
    marginLeft: "42%",
  },
  profileItems: {
    margin: "2%",
  },
  types: {
    paddingLeft: "10px",
  },
  species: {
    paddingLeft: "15%",
    paddingTop: "10px",
  },
}));

const typeColors = {
  bug: "B1C12E",
  dark: "4F3A2D",
  dragon: "755EDF",
  electric: "FCBC17",
  fairy: "F4B1F4",
  fighting: "823551",
  fire: "E73B0C",
  flying: "A3B3F7",
  ghost: "6060B2",
  grass: "74C236",
  ground: "D3B357",
  ice: "A3E7FD",
  normal: "C8C4BC",
  poison: "934594",
  psychic: "ED4882",
  rock: "B9A156",
  steel: "B5B5C3",
  water: "3295F6",
};

const initialState = {
  description: "",
  eggGroups: "",
  catchRate: "",
  genderRatioMale: "",
  genderRatioFemale: "",
  evs: "",
  hatchSteps: "",
};

const Pokemon = (props) => {
  const { history, match } = props;
  const classes = useStyles();
  const { params } = match;
  const { pokemonId } = params;
  const [pokemon, setPokemon] = useState(undefined);
  const [pokemonDetails, setPokemonDetails] = useState(initialState);

  useEffect(() => {
    axios
      .get(`https://pokeapi.co/api/v2/pokemon/${pokemonId}/`)
      .then(function (response) {
        const { data } = response;
        setPokemon(data);
      })
      .catch(function (error) {
        setPokemon(false);
      });
  }, [pokemonId]);

  const pokemonSpeciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`;

  useEffect(() => {
    axios.get(pokemonSpeciesUrl).then(function (request) {
      let description = "";
      request.data.flavor_text_entries.some((flavor) => {
        if (flavor.language.name === "en") {
          description = flavor.flavor_text;
          return;
        }
      });
      const femaleRate = request.data.gender_rate;
      const genderRatioFemale = 12.5 * femaleRate;
      const genderRatioMale = 12.5 * (8 - femaleRate);

      const catchRate = Math.round((100 / 255) * request.data.capture_rate);

      const eggGroups = request.data.egg_groups
        .map((group) => {
          return group.name
            .toLowerCase()
            .split(" ")
            .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
            .join(" ");
        })
        .join(", ");

      const hatchSteps = 255 * (request.data.hatch_counter + 1);

      setPokemonDetails({
        description,
        genderRatioFemale,
        genderRatioMale,
        catchRate,
        eggGroups,
        hatchSteps,
      });
    });
  });

  const generatePokemonJSX = () => {
    const {
      name,
      id,
      species,
      height,
      weight,
      types,
      sprites,
      stats,
    } = pokemon;

    const {
      description,
      eggGroups,
      catchRate,
      genderRatioMale,
      genderRatioFemale,
      hatchSteps,
    } = pokemonDetails;

    const fullImageUrl = `https://pokeres.bastionbot.org/images/pokemon/${id}.png`;
    const { front_default, back_default, front_shiny, back_shiny } = sprites;

    const pokemonTypes = types.map((typeInfo) => {
      const { type } = typeInfo;
      const { name } = type;

      return (
        <Box
          style={{
            backgroundColor: `#${typeColors[name]}`,
            color: "white",

            borderRadius: 5,
          }}
          width="50%"
        >
          <Typography key={name} align="center">
            {" "}
            {`${name}`}
          </Typography>
        </Box>
      );
    });

    const statTypes = stats.map((statInfo) => {
      const { base_stat, stat } = statInfo;
      const { name } = stat;
      const normaliseValue = (value) => (value * 100) / 250;

      return (
        <Box>
          <Typography align="left">{name}: </Typography>
          <Box
            display="flex"
            color="white"
            position="absolute"
            // left={base_stat}
            zIndex="tooltip"
          >
            <Typography className={classes.statsInBar}>{base_stat}</Typography>
          </Box>
          <Box>
            <StatStyles
              variant="determinate"
              value={normaliseValue(base_stat)}
            />
          </Box>
        </Box>
      );
    });

    return (
      <>
        <Grid item xs={12} className={classes.pokemonContainer} display="flex">
          <Card>
            <CardMedia>
              <Typography
                className={classes.cardNumber}
                variant="h4"
                display="inline"
              >
                #{`${id}`}{" "}
              </Typography>
              <Typography
                className={classes.cardName}
                variant="h4"
                display="inline"
              >
                {toFirstCharUppercase(name)}
              </Typography>

              <Divider />
              <CardContent>
                <Grid
                  container
                  direction="row"
                  justify="center"
                  alignItems="center"
                  spacing={5}
                >
                  <Grid item xs={12} sm={4} align="center">
                    <img
                      style={{ width: "300px", height: "300px" }}
                      src={fullImageUrl}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    {statTypes}
                  </Grid>
                </Grid>

                <Typography className={classes.description}>
                  {description}
                </Typography>
                <Divider />
                <Typography
                  className={classes.profile}
                  variant="h5"
                  display="inline"
                >
                  Profile
                </Typography>
                <Grid
                  container
                  direction="row"
                  justify="center"
                  alignItems="center"
                  className={classes.card}
                >
                  <Grid item xs={6} sm={4}>
                    <Typography className={classes.profileItems}>
                      Height: {height} ft.{" "}
                    </Typography>

                    <Typography className={classes.profileItems}>
                      Weight: {weight} lbs
                    </Typography>

                    <Typography className={classes.profileItems}>
                      Catch Rate: {catchRate} %{" "}
                    </Typography>

                    <Typography className={classes.profileItems}>
                      Gender Ratio: Male: {genderRatioMale}% Female:
                      {genderRatioFemale}%
                    </Typography>
                  </Grid>

                  <Grid item xs={6} sm={4}>
                    <Typography className={classes.profileItems}>
                      Egg Groups: {eggGroups}
                    </Typography>

                    <Typography className={classes.profileItems}>
                      Hatch Steps: {hatchSteps}
                    </Typography>

                    <Typography className={classes.profileItems}>
                      {" "}
                      Types:
                    </Typography>
                    <Typography className={classes.types}>
                      {pokemonTypes}
                    </Typography>
                  </Grid>
                </Grid>
                <Typography variant="h5" className={classes.profile}>
                  Species
                </Typography>
                <Grid
                  container
                  direction="row"
                  justify="center"
                  alignItems="center"
                  className={classes.card}
                >
                  <Grid item xs={6} sm={4}>
                    <Typography className={classes.species}>Normal</Typography>
                    <CardMedia>
                      <img src={front_default} />
                      <img src={back_default} />
                    </CardMedia>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography className={classes.species}>Shiny</Typography>
                    <CardMedia>
                      <img src={front_shiny} />
                      <img src={back_shiny} />
                    </CardMedia>
                  </Grid>
                </Grid>

                {/* <Typography>
                  {"Species:"} <Link href={species.url}>{species.name} </Link>
                </Typography> */}
              </CardContent>
            </CardMedia>
          </Card>
        </Grid>
      </>
    );
  };

  return (
    <div>
      {pokemon === undefined && <CircularProgress />}
      {pokemon !== undefined && pokemon && generatePokemonJSX()}
      {pokemon === false && <Typography> Pokemon not found </Typography>}
      {pokemon !== undefined && (
        <Grid display="flex" item xs={12}>
          <Button
            className={classes.backButton}
            variant="contained"
            onClick={() => history.push("/")}
          >
            Back to Pokedex
          </Button>
        </Grid>
      )}
    </div>
  );
};

export default Pokemon;
